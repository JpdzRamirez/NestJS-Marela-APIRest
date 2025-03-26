import { Injectable,HttpException,HttpStatus } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager, Between,QueryFailedError } from 'typeorm';
import { TypeDocument } from './type_document.entity';
import { TypeDocumentDto } from './dto/typeDocument.dto';
import { UUID } from 'crypto';

@Injectable()
export class TypeDocumentRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  /** ✅
   * Guarda todas los tipos de documentos no duplicados y se retorna los registros insertados y duplicados
   */
  async submitAllTypeDocument(
    schema: string,
     typeDocumentArrayFiltred: { uniqueTypeDocument: TypeDocument[]; duplicateTypeDocument: TypeDocumentDto[] }
  ): Promise<{
    message: string;
    status: boolean;
    inserted: { 
      id: number;
      id_tipodocumento: string;
      nombre: string 
    }[];
    duplicated: TypeDocumentDto[];
    existing:TypeDocumentDto[];
  }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();    

    const insertedTypeDocuments: { id: number;id_tipodocumento: string ; nombre: string }[] = [];
    const duplicatedTypeDocuments=typeDocumentArrayFiltred.duplicateTypeDocument;
    const syncronizedTypeDocuments: TypeDocumentDto[] = [];

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
        existingDocuments.map((document) =>
          document.nombre
            .trim()
            .toLowerCase()
            .replace(/\s+/g, " ")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
        )
      );
      
      // 🔥 Filtrar solo los documentos que no están duplicados
      const uniqueDocuments = typeDocumentArrayFiltred.uniqueTypeDocument.filter((tc) => {
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
            syncronizedTypeDocuments.push(existingDocument);
            return false;
          }
        }
        return true;
      });

      if (uniqueDocuments.length > 0) {
        // 🔥 Insertar solo los documentos que no estaban duplicados
        await entityManager
          .createQueryBuilder()
          .insert()
          .into(`${schema}.tipo_documento`, [
            'nombre',
            'id_tipodocumento',
            'uploaded_by_authsupa',
            'sync_with'])
          .values(
            uniqueDocuments.map((tc) => ({
              nombre: tc.nombre,
              id_tipodocumento: tc.id_tipodocumento,
              uploaded_by_authsupa: tc.uploaded_by_authsupa,
              sync_with: () => `'${JSON.stringify(tc.sync_with)}'::jsonb`, // 🔥 Convertir a JSONB
            }))
          ).execute();

        // 🔥 Asociar los nombres insertados con los IDs originales
        insertedTypeDocuments.push(
          ...uniqueDocuments.map((tc) => ({
            id: tc.id, 
            id_tipodocumento: tc.id_tipodocumento, 
            nombre: tc.nombre,
          }))
        );
        
        }

      await queryRunner.commitTransaction();
      
      if(uniqueDocuments.length === 0){                      
        return {
          message: "¡El cargue ha terminado! no hay datos pendientes por sincronizar",        
          status: false,
          inserted: [],
          duplicated: duplicatedTypeDocuments,
          existing:syncronizedTypeDocuments
        };
      }
      
      return {
        message: "Cargue exitoso, se han obtenido los siguientes resultados:",
        status:true,
        inserted: insertedTypeDocuments,
        duplicated: duplicatedTypeDocuments,
        existing:syncronizedTypeDocuments
      };
    } catch (error) {

      await queryRunner.rollbackTransaction();
      if (error instanceof HttpException) {
        throw error;
      } else if (error instanceof QueryFailedError) {
        const message = error.message.toLowerCase();

          if (message.includes('duplicate key value')) {
            throw new HttpException('Registro duplicado', HttpStatus.CONFLICT); // 409
          }
          
          if (message.includes('foreign key constraint')) {
            throw new HttpException('Error de integridad referencial', HttpStatus.BAD_REQUEST); // 400
          }

          if (message.includes('not-null constraint')) {
            throw new HttpException('Campo obligatorio no puede estar vacío', HttpStatus.BAD_REQUEST); // 400
          }

          if (message.includes('syntax error')) {
            throw new HttpException('Error en la consulta SQL', HttpStatus.INTERNAL_SERVER_ERROR); // 500
          }

          if (message.includes('connection refused')) {
            throw new HttpException('Error de conexión con la base de datos', HttpStatus.SERVICE_UNAVAILABLE); // 503
          }

          throw new HttpException(`Error en la base de datos: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR); // 500 por defecto
      } else {
        throw new HttpException(`Error inesperado: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
      }
      
    } finally {
      await queryRunner.release();
    }
  }


  /** ✅
   * Retorna todos los tipos de documentos que el usuario no tiene sincronizados
   */
  async getAllTypeDocument(
    schema: string,
    uuid_authsupa: string,
  ): Promise<{
    message: string,
    status:boolean,
    type_documents:TypeDocument[]
  }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const entityManager = queryRunner.manager;

      // Obtener nombres que ya existen en la base de datos
      const notSyncTypeDocument = await entityManager
      .createQueryBuilder()
      .select('tipo_documento.*') // Agregado `.*` para seleccionar todos los campos
      .from(`${schema}.tipo_documento`, 'tipo_documento')
      .where(`NOT EXISTS (
        SELECT 1 FROM jsonb_array_elements(tipo_documento.sync_with::jsonb) AS elem
        WHERE elem->>'uuid_authsupa' = :uuid_authsupa
      )`, { uuid_authsupa })
      .getRawMany();


      await queryRunner.commitTransaction();

      if(notSyncTypeDocument.length ===0){
        return {
          message: `¡Proceso finalizado, no existen registros pendientes por sincronizar!!`,
          status:false,
          type_documents: []
        };
      }

      return {
        message:
          'Conexión exitosa, se han obtenido los siguientes tipos de documentos no sincronizados:',
        status:true,
        type_documents: notSyncTypeDocument
      };
    } catch (error) {

      await queryRunner.rollbackTransaction();

      if (error instanceof HttpException) {
        throw error;
      } else if (error instanceof QueryFailedError) {
        const message = error.message.toLowerCase();

          if (message.includes('duplicate key value')) {
            throw new HttpException('Registro duplicado', HttpStatus.CONFLICT); // 409
          }
          
          if (message.includes('foreign key constraint')) {
            throw new HttpException('Error de integridad referencial', HttpStatus.BAD_REQUEST); // 400
          }

          if (message.includes('not-null constraint')) {
            throw new HttpException('Campo obligatorio no puede estar vacío', HttpStatus.BAD_REQUEST); // 400
          }

          if (message.includes('syntax error')) {
            throw new HttpException('Error en la consulta SQL', HttpStatus.INTERNAL_SERVER_ERROR); // 500
          }

          if (message.includes('connection refused')) {
            throw new HttpException('Error de conexión con la base de datos', HttpStatus.SERVICE_UNAVAILABLE); // 503
          }

          throw new HttpException(`Error en la base de datos: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR); // 500 por defecto
      } else {
        throw new HttpException(`Error inesperado: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
      }

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
    syncronized: TypeDocumentDto[],
    duplicated: TypeDocumentDto[] | null;
  }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const syncronized : TypeDocumentDto[] = [];
  
    try {
      const entityManager = queryRunner.manager;      
      
      if(typeDocumentArrayFiltred.uniqueTypeDocument.length>0){  
      // 🔥 Obtener todos los registros existentes que coincida con la lista filtrada
      const existingTypeDocuments = await entityManager
        .createQueryBuilder()
        .select("tipo_documento.*")
        .from(`${schema}.tipo_documento`, "tipo_documento")
        .where("LOWER(unaccent(tipo_documento.nombre)) IN (:...nombres)", {
          nombres: typeDocumentArrayFiltred.uniqueTypeDocument.map((c) => c.nombre),
        })
        .getRawMany();
  
      for (const typeDocument of typeDocumentArrayFiltred.uniqueTypeDocument) {
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

              syncronized.push({ ...existingTypeDocument });
          }
        }
      }      

      }
      if(syncronized.length ===0){
        return {
          message: `¡La Sincronización ha terminado, la base de datos ya se encuentra sincronizada!!`,
          status: false,
          syncronized:syncronized,
          duplicated: typeDocumentArrayFiltred.duplicateTypeDocument,
        };
      }
      
      await queryRunner.commitTransaction();

      return {
        message: "Sincronización exitosa, se han obtenido los siguientes resultados",
        status: true,
        syncronized:syncronized,
        duplicated: typeDocumentArrayFiltred.duplicateTypeDocument,
      };
    } catch (error) {

      await queryRunner.rollbackTransaction();      

      if (error instanceof HttpException) {
        throw error;
      } else if (error instanceof QueryFailedError) {
        const message = error.message.toLowerCase();

          if (message.includes('duplicate key value')) {
            throw new HttpException('Registro duplicado', HttpStatus.CONFLICT); // 409
          }
          
          if (message.includes('foreign key constraint')) {
            throw new HttpException('Error de integridad referencial', HttpStatus.BAD_REQUEST); // 400
          }

          if (message.includes('not-null constraint')) {
            throw new HttpException('Campo obligatorio no puede estar vacío', HttpStatus.BAD_REQUEST); // 400
          }

          if (message.includes('syntax error')) {
            throw new HttpException('Error en la consulta SQL', HttpStatus.INTERNAL_SERVER_ERROR); // 500
          }

          if (message.includes('connection refused')) {
            throw new HttpException('Error de conexión con la base de datos', HttpStatus.SERVICE_UNAVAILABLE); // 503
          }

          throw new HttpException(`Error en la base de datos: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR); // 500 por defecto
      } else {
        throw new HttpException(`Error inesperado: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
      }

    } finally {
      await queryRunner.release();
    }
  }
  
}
