import { Injectable } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager, Between } from 'typeorm';
import { TypeDocument } from './type_document.entity';
import { TypeDocumentDto } from './dto/typeDocument.dto';
import { UUID } from 'crypto';

@Injectable()
export class TypeDocumentRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  /** ✅
   * Guarda todas los tipos de clientes no duplicados y se retorna los registros insertados y duplicados
   */
  async submitAllTypeDocument(
    schema: string,
     typeDocumentArrayFiltred: { uniqueTypeDocument: TypeDocument[]; duplicateTypeDocument: TypeDocumentDto[] }
  ): Promise<{
    message: string;
    status: boolean;
    inserted: { id: number; id_tipodocumento: string ; nombre: string }[];
    duplicated: TypeDocumentDto[];
  }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let messageResponse='';

    const insertedTypeDocuments: { id: number;id_tipodocumento: string ; nombre: string }[] = [];
    const duplicatedTypeDocuments=typeDocumentArrayFiltred.duplicateTypeDocument;

    try {
      const entityManager = queryRunner.manager;

      const normalizedNewTypeDocuments = typeDocumentArrayFiltred.uniqueTypeDocument.map((tc) => ({
        ...tc,
        nombre: tc.nombre
          .trim()
          .toLowerCase()
          .replace(/\s+/g, " ")
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, ""), // Quitar acentos y espacios innecesarios
      }));
      
      // 🔥 Obtener nombres normalizados que ya existen en la base de datos
      const existingDocuments = await entityManager
        .createQueryBuilder()
        .select(['id', 'nombre'])
        .from(`${schema}.tipo_documento`, 'tipo_documento')
        .where('LOWER(unaccent(tipo_documento.nombre)) IN (:...nombres)', {
          nombres: normalizedNewTypeDocuments.map((tc) => tc.nombre),
        })
        .getRawMany();
      
      // 🔥 Normalizar nombres existentes para comparación eficiente
      const existingNames = new Set(
        existingDocuments.map((client) =>
          client.nombre
            .trim()
            .toLowerCase()
            .replace(/\s+/g, " ")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
        )
      );
      
      // 🔥 Filtrar solo los documentos que no están duplicados
      const uniqueDocument = typeDocumentArrayFiltred.uniqueTypeDocument.filter((tc) => {
        const normalizedName = tc.nombre
          .trim()
          .toLowerCase()
          .replace(/\s+/g, " ")
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");

        if (existingNames.has(normalizedName)) {
          let existingDocument = existingDocuments.find(
            (c) => c.nombre.localeCompare(tc.nombre, undefined, { sensitivity: "base" }) === 0
          );

          if (existingDocument) {
            existingDocument.id=tc.id;
            existingDocument.source_failure='DataBase';
            duplicatedTypeDocuments.push(existingDocument);
            return false;
          }
        }
        return true;
      });

      if (uniqueDocument.length > 0) {
        // 🔥 Insertar solo los documentos que no estaban duplicados
        await entityManager
          .createQueryBuilder()
          .insert()
          .into(`${schema}.tipo_documento`, ['nombre','id_tipodocumento', 'uploaded_by_authsupa', 'sync_with'])
          .values(
            uniqueDocument.map((tc) => ({
              nombre: tc.nombre,
              id_tipodocumento: tc.id_tipodocumento,
              uploaded_by_authsupa: tc.uploaded_by_authsupa,
              sync_with: () => `'${JSON.stringify(tc.sync_with)}'::jsonb`, // 🔥 Convertir a JSONB
            }))
          ).execute();

        // 🔥 Asociar los nombres insertados con los IDs originales
        insertedTypeDocuments.push(
          ...uniqueDocument.map((tc) => ({
            id: tc.id, 
            id_tipodocumento: tc.id_tipodocumento, 
            nombre: tc.nombre,
          }))
        );
        messageResponse="Cargue exitoso, se han obtenido los siguientes resultados:";
        }else{
        messageResponse= "La base de datos ya se encuentra sincronizada; Datos ya presentes en BD";
        }
      await queryRunner.commitTransaction();
      
      return {
        message: "Cargue exitoso, se han obtenido los siguientes resultados:",
        status:true,
        inserted: insertedTypeDocuments,
        duplicated: duplicatedTypeDocuments,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('❌ Error en submitAllTypeDocument:', error);
      return {
        message: "¡El cargue de datos ha fallado! -> "+ error.message, 
        status:false,
        inserted: [],
        duplicated: [],
      };
    } finally {
      await queryRunner.release();
    }
  }


  /** ✅
   * Retorna todos los tipos de clientes que el usuario no tiene sincronizados
   */
  async getAllTypeDocument(
    schema: string,
    uuid_authsupa: string,

  ): Promise<{
    message: string,
    type_documents:TypeDocument[]
  }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const entityManager = queryRunner.manager;

      // Obtener nombres que ya existen en la base de datos
      const notSyncTypeClient = await entityManager
      .createQueryBuilder()
      .select('tipo_documento.*') // Agregado `.*` para seleccionar todos los campos
      .from(`${schema}.tipo_documento`, 'tipo_documento')
      .where(`NOT EXISTS (
        SELECT 1 FROM jsonb_array_elements(tipo_documento.sync_with::jsonb) AS elem
        WHERE elem->>'uuid_authsupa' = :uuid_authsupa
      )`, { uuid_authsupa })
      .getRawMany();


      await queryRunner.commitTransaction();

      return {
        message:
          'Conexión exitosa, se han obtenido los siguientes tipos de documentos no sincronizados:',
        type_documents: notSyncTypeClient
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('❌ Error en getAllTypeDocument:', error);
      return {
        message: "¡La conexión ha fallado! -> "+ error.message,
        type_documents: []
      };
    } finally {
      await queryRunner.release();
    }
  }

  /** ✅
   *  Actualiza los registros sincronizados en el mobil
   */
  async syncTypeDocument(
    schema: string,
    uuid_authsupa: string,
    typeDocumentArrayFiltred: { uniqueTypeDocument: TypeDocumentDto[]; duplicateTypeDocument: TypeDocumentDto[] }
  ): Promise<{
    message: string;
    status: boolean;
    duplicated: TypeDocumentDto[] | null;
  }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
  
    try {
      const entityManager = queryRunner.manager;
      const uniqueTypeDocument = typeDocumentArrayFiltred.uniqueTypeDocument;
      
      if(uniqueTypeDocument.length>0){  
      // 🔥 Obtener todos los registros existentes que coincida con la lista filtrada
      const existingTypeDocuments = await entityManager
        .createQueryBuilder()
        .select("tipo_documento.*")
        .from(`${schema}.tipo_documento`, "tipo_documento")
        .where("LOWER(unaccent(tipo_documento.nombre)) IN (:...nombres)", {
          nombres: uniqueTypeDocument.map((c) => c.nombre),
        })
        .getRawMany();
  
      for (const typeDocument of uniqueTypeDocument) {
        const existingTypeDocument = existingTypeDocuments.find(
          (c) => c.nombre.localeCompare(typeDocument.nombre, undefined, { sensitivity: "base" }) === 0
        );
  
        if (existingTypeDocument) {
          let syncWithArray = existingTypeDocument.sync_with 
          ? (typeof existingTypeDocument.sync_with === "string" 
              ? JSON.parse(existingTypeDocument.sync_with) 
              : existingTypeDocument.sync_with) 
          : [];
  
          // 🔥 Verificar si ya existe el uuid en `sync_with`
          const alreadyExists = syncWithArray.some((entry: any) => entry.uuid_authsupa === uuid_authsupa);
  
          if (!alreadyExists) {
            syncWithArray.push({ id: typeDocument.id, uuid_authsupa });
  
            // 🔥 Actualizar `sync_with` correctamente
            await entityManager
              .createQueryBuilder()
              .update(`${schema}.tipo_documento`)
              .set({ sync_with: () => `'${JSON.stringify(syncWithArray)}'::jsonb` }) // 🔥 Conversión segura a JSONB
              .where("nombre = :nombre", { nombre: existingTypeDocument.nombre })
              .execute();
          }
        }
      }
  
      await queryRunner.commitTransaction();
    }
      return {
        message: "Sincronización completada",
        status: true,
        duplicated: typeDocumentArrayFiltred.duplicateTypeDocument,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error("❌ Error en syncTypeClient:", error);
      return {
        message: "¡La Sincronización ha fallado ! -> "+ error.message, 
        status: false,
        duplicated: null,
      };
    } finally {
      await queryRunner.release();
    }
  }
  
}
