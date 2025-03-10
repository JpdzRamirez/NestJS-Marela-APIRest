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
    newTypeClients: TypeClient[],
  ): Promise<{
    message: string;
    inserted: { id: number; nombre: string }[];
    duplicated: { id: number; nombre: string }[];
  }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const insertedClients: { id: number; nombre: string }[] = [];
    const duplicatedClients: { id: number; nombre: string }[] = [];

    try {
      const entityManager = queryRunner.manager;

      // Obtener nombres que ya existen en la base de datos
      const existingClients = await entityManager
        .createQueryBuilder()
        .select(['id', 'nombre'])
        .from(`${schema}.tipo_cliente`, 'tipo_cliente')
        .where('nombre IN (:...nombres)', {
          nombres: newTypeClients.map((tc) => tc.nombre),
        })
        .getRawMany();

      const existingNames = new Set(
        existingClients.map((client) => client.nombre),
      );

      // Filtrar solo los clientes que no están duplicados
      const uniqueClients = newTypeClients.filter((tc) => {
        if (existingNames.has(tc.nombre)) {
          const existingClient = existingClients.find(
            (c) => c.nombre === tc.nombre,
          );
          if (existingClient) {
            duplicatedClients.push({
              id: existingClient.id,
              nombre: existingClient.nombre,
            });
            return false;
          }
        }
        return true;
      });

      if (uniqueClients.length > 0) {
        // Insertar solo los clientes que no estaban duplicados
        await entityManager
          .createQueryBuilder()
          .insert()
          .into(`${schema}.tipo_cliente`)
          .values(
            uniqueClients.map((tc) => ({
              ...tc,
              sync_with: () => `'${JSON.stringify(tc.sync_with)}'::jsonb`, // 🔥 Convertir a JSONB
            })),
          )
          .returning(['id', 'nombre']) // Retornar los datos insertados
          .execute();

        // Agregar a la lista de insertados
        insertedClients.push(
          ...uniqueClients.map((tc) => ({
            id: tc.id,
            nombre: tc.nombre ?? '',
          })),
        );
      }

      await queryRunner.commitTransaction();

      return {
        message:
          'Sincronización exitosa, se han obtenido los siguientes resultados:',
        inserted: insertedClients,
        duplicated: duplicatedClients,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('❌ Error en submitAllTypeClient:', error);
      return {
        message: '¡La Sincronización ha fallado!',
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
    type_client:TypeClient[]
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
          'Sincronización exitosa, se han obtenido los siguientes resultados:',
        type_client: notSyncTypeClient
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('❌ Error en getAllTypeClient:', error);
      return {
        message: '¡La Sincronización ha fallado, retornando desde la base de datos!',
        type_client: []
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
