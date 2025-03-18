import { Injectable } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager, Between } from 'typeorm';
import { TypeClient } from './type_client.entity';
import { TypeClientDto } from './dto/typeClient.dto';
import { UUID } from 'crypto';

@Injectable()
export class TypeClientRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  /** ✅
   * Guarda todas los tipos de clientes no duplicados y se retorna los registros insertados y duplicados
   */
  async submitAllTypeClient(
    schema: string,
    typeClientArrayFiltred: { uniqueTypeClient: TypeClient[]; duplicateTypeClient: TypeClientDto[] }
  ): Promise<{
    message: string;
    status: boolean;
    inserted: { id: number; id_tipocliente: string ;nombre: string }[];
    duplicated: TypeClientDto[];
  }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let messageResponse='';

    const insertedTypeClients: { id: number;id_tipocliente:string ;nombre: string }[] = [];
    const duplicatedTypeClients=typeClientArrayFiltred.duplicateTypeClient;

    try {
      const entityManager = queryRunner.manager;

      const normalizedNewTypeClients = typeClientArrayFiltred.uniqueTypeClient.map((tc) => ({
        ...tc,
        nombre: tc.nombre
          .trim()
          .toLowerCase()
          .replace(/\s+/g, " ")
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, ""), // Quitar acentos y espacios innecesarios
      }));
      
      // 🔥 Obtener nombres normalizados que ya existen en la base de datos
      const existingTyeClients = await entityManager
        .createQueryBuilder()
        .select(['id', 'nombre'])
        .from(`${schema}.tipo_cliente`, 'tipo_cliente')
        .where('LOWER(unaccent(tipo_cliente.nombre)) IN (:...nombres)', {
          nombres: normalizedNewTypeClients.map((tc) => tc.nombre),
        })
        .getRawMany();
      
      // 🔥 Normalizar nombres existentes para comparación eficiente
      const existingNames = new Set(
        existingTyeClients.map((client) =>
          client.nombre
            .trim()
            .toLowerCase()
            .replace(/\s+/g, " ")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
        )
      );
      
      // 🔥 Filtrar solo los clientes que no están duplicados
      const uniqueTypeClients = typeClientArrayFiltred.uniqueTypeClient.filter((tc) => {
        const normalizedName = tc.nombre
          .trim()
          .toLowerCase()
          .replace(/\s+/g, " ")
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");

        if (existingNames.has(normalizedName)) {
          let existingTypeClient = existingTyeClients.find(
            (c) => c.nombre.localeCompare(tc.nombre, undefined, { sensitivity: "base" }) === 0
          );

          if (existingTypeClient) {
            existingTypeClient.id=tc.id;
            existingTypeClient.id_tipocliente=tc.id_tipocliente;
            existingTypeClient.source_failure='DataBase';
            duplicatedTypeClients.push(existingTypeClient);
            return false;
          }
        }
        return true;
      });

      if (uniqueTypeClients.length > 0) {
        // 🔥 Insertar solo los clientes que no estaban duplicados
        await entityManager
          .createQueryBuilder()
          .insert()
          .into(`${schema}.tipo_cliente`, ['nombre','id_tipocliente', 'uploaded_by_authsupa', 'sync_with'])
          .values(
            uniqueTypeClients.map((tc) => ({
              nombre: tc.nombre,
              id_tipocliente: tc.id_tipocliente,
              uploaded_by_authsupa: tc.uploaded_by_authsupa,
              sync_with: () => `'${JSON.stringify(tc.sync_with)}'::jsonb`, // 🔥 Convertir a JSONB
            }))
          ).execute();

        // 🔥 Asociar los nombres insertados con los IDs originales
        insertedTypeClients.push(
          ...uniqueTypeClients.map((tc) => ({
            id: tc.id, 
            id_tipocliente: tc.id_tipocliente,
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
        inserted: insertedTypeClients,
        duplicated: duplicatedTypeClients,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('❌ Error en submitAllTypeClient:', error);
      return {
        message: '¡El cargue ha fallado!! -> '+ error.message, 
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
  async getAllTypeClient(
    schema: string,
    uuid_authsupa: string,

  ): Promise<{
    message: string,
    type_clients:TypeClient[]
  }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const entityManager = queryRunner.manager;

      // Obtener nombres que ya existen en la base de datos
      const notSyncTypeClient = await entityManager
      .createQueryBuilder()
      .select('tipo_cliente.*') // Agregado `.*` para seleccionar todos los campos
      .from(`${schema}.tipo_cliente`, 'tipo_cliente')
      .where(`NOT EXISTS (
        SELECT 1 FROM jsonb_array_elements(tipo_cliente.sync_with::jsonb) AS elem
        WHERE elem->>'uuid_authsupa' = :uuid_authsupa
      )`, { uuid_authsupa })
      .getRawMany();


      await queryRunner.commitTransaction();

      return {
        message:
          'Conexión exitosa, se han obtenido los siguientes tipos de clientes no sincronizados:',
        type_clients: notSyncTypeClient
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('❌ Error en getAllTypeClient:', error);
      return {
        message: '¡La conexión ha fallado, retornando desde la base de datos! ->'+ error.message,
        type_clients: []
      };
    } finally {
      await queryRunner.release();
    }
  }

  /** ✅
   *  Actualiza los registros sincronizados en el mobil
   */
  async syncTypeClient(
    schema: string,
    uuid_authsupa: string,
    typeClientArrayFiltred: { uniqueTypeClient: TypeClientDto[]; duplicateTypeClient: TypeClientDto[] }
  ): Promise<{
    message: string;
    status: boolean;
    duplicated: TypeClientDto[] | null;
  }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
  
    try {
      const entityManager = queryRunner.manager;
      const uniqueTypeClient = typeClientArrayFiltred.uniqueTypeClient;
  
      if(uniqueTypeClient.length>0){      
      // 🔥 Obtener todos los registros existentes que coincida con la lista filtrada
      const existingClients = await entityManager
        .createQueryBuilder()
        .select("tipo_cliente.*")
        .from(`${schema}.tipo_cliente`, "tipo_cliente")
        .where("LOWER(unaccent(tipo_cliente.nombre)) IN (:...nombres)", {
          nombres: uniqueTypeClient.map((c) => c.nombre),
        })
        .getRawMany();
  
      for (const typeClient of uniqueTypeClient) {
        const existingTypeClient = existingClients.find(
          (c) => c.nombre.localeCompare(typeClient.nombre, undefined, { sensitivity: "base" }) === 0
        );
  
        if (existingTypeClient) {
          let syncWithArray = existingTypeClient.sync_with 
          ? (typeof existingTypeClient.sync_with === "string" 
              ? JSON.parse(existingTypeClient.sync_with) 
              : existingTypeClient.sync_with) 
          : [];
  
          // 🔥 Verificar si ya existe el uuid en `sync_with`
          const alreadyExists = syncWithArray.some((entry: any) => entry.uuid_authsupa === uuid_authsupa);
  
          if (!alreadyExists) {
            syncWithArray.push({ id: typeClient.id, uuid_authsupa });
  
            // 🔥 Actualizar `sync_with` correctamente
            await entityManager
              .createQueryBuilder()
              .update(`${schema}.tipo_cliente`)
              .set({ sync_with: () => `'${JSON.stringify(syncWithArray)}'::jsonb` }) // 🔥 Conversión segura a JSONB
              .where("nombre = :nombre", { nombre: existingTypeClient.nombre })
              .execute();
          }
        }
      }
  
      await queryRunner.commitTransaction();
    }
      return {
        message: "Sincronización completada",
        status: true,
        duplicated: typeClientArrayFiltred.duplicateTypeClient,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error("❌ Error en syncTypeClient:", error);
      return {
        message: "¡La Sincronización ha fallado, retornando desde la base de datos!",
        status: false,
        duplicated: null,
      };
    } finally {
      await queryRunner.release();
    }
  }
  
}
