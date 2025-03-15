import { Injectable } from '@nestjs/common';
import { InjectRepository,InjectDataSource  } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager, Between } from 'typeorm';
import { Client } from './client.entity';

import { ClientsDto } from './dto/Clients.dto';

@Injectable()
export class ClientRepository {
  constructor(        
    @InjectDataSource() private readonly dataSource: DataSource
  ) {}

    /** ✅
     * Inserta todos los clientes y retorna los clientes insertados
     */
    async submitAllClients(schema: string, newClients: Client[]): Promise<{ 
      message: string,
      status: boolean,
      inserted: { id: number; id_cliente: string; nombre: string }[]     
    }>{
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
      
      const insertedClients: { id: number; id_cliente: string; nombre: string }[] = [];
      try {
        const entityManager = queryRunner.manager;
    
        // 🔥 Insertar los clientes con el esquema dinámico
          await entityManager
          .createQueryBuilder()
          .insert()
          .into(`${schema}.clientes`, [
            'id_cliente',
            'nombre',
            'apellido', 
            'documento', 
            'correo', 
            'direccion', 
            'telefono', 
            'tipocliente_id', 
            'tipodocumento_id', 
            'uploaded_by_authsupa', 
            'sync_with'])
          .values(
            newClients.map((tc) => ({
              id_cliente: tc.id_cliente,
              nombre: tc.nombre,
              apellido: tc.apellido,
              documento: tc.documento,
              correo: tc.correo,
              direccion: tc.direccion,
              telefono: tc.telefono,
              tipocliente_id: tc.tipo_cliente?.id_tipocliente,
              tipodocumento_id: tc.tipo_documento?.id_tipodocumento,
              uploaded_by_authsupa: tc.uploaded_by_authsupa,
              sync_with: () => `'${JSON.stringify(tc.sync_with)}'::jsonb`, // 🔥 Convertir a JSONB
            }))
          )
          .returning(["id", "id_cliente", "nombre"]) 
          .execute();
          
        // 🔥 Asociar los nombres insertados con los IDs originales
        insertedClients.push(
          ...newClients.map((tc) => ({
              id: tc.id,
              id_cliente:tc.id_cliente,
              nombre: tc.nombre,
            }))
        ); 

        await queryRunner.commitTransaction();
    
        return {
          message: "Sincronización exitosa, se han obtenido los siguientes resultados:",
          status: true,
          inserted: insertedClients, // Convertir resultado
        };
      } catch (error) {
        await queryRunner.rollbackTransaction();
        console.error("❌ Error en submitAllClients:", error);
        
        return {
          message: "¡La sincronización ha fallado!",
          status: false,
          inserted: [],
        };
      } finally {
        await queryRunner.release();
      }
    }


/** ✅
   * Retorna todos los tipos de clientes que el usuario no tiene sincronizados
   */
  async getAllClients(
    schema: string,
    uuid_authsupa: string,
  ): Promise<{
    message: string,
    clients:Client[]
  }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const entityManager = queryRunner.manager;

      // Obtener nombres que ya existen en la base de datos
      const notSyncTypeClient = await entityManager
      .createQueryBuilder()
      .select('clientes.*') // Agregado `.*` para seleccionar todos los campos
      .from(`${schema}.clientes`, 'clientes')
      .where(`NOT EXISTS (
        SELECT 1 FROM jsonb_array_elements(clientes.sync_with::jsonb) AS elem
        WHERE elem->>'uuid_authsupa' = :uuid_authsupa
      )`, { uuid_authsupa })
      .getRawMany();


      await queryRunner.commitTransaction();

      return {
        message:
          'Sincronización exitosa, se han obtenido los siguientes resultados:',
        clients: notSyncTypeClient
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('❌ Error en getAllTypeClient:', error);
      return {
        message: '¡La Sincronización ha fallado, retornando desde la base de datos!',
        clients: []
      };
    } finally {
      await queryRunner.release();
    }
  }

  /** ✅
   *  Actualiza los registros sincronizados en el mobil
   */
  async syncClient(
    schema: string,
    uuid_authsupa: string,
    clientArrayFiltred:  Client[] 
  ): Promise<{
    message: string,
    status: boolean,
  }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
  
    try {
      const entityManager = queryRunner.manager;
      const uniqueClient = clientArrayFiltred;
  
      // 🔥 Obtener todos los registros existentes que coincida con la lista filtrada
      const existingClients = await entityManager
        .createQueryBuilder()
        .select("clientes.*")
        .from(`${schema}.clientes`, "clientes")
        .where("LOWER(unaccent(clientes.nombre)) IN (:...nombres)", {
          nombres: uniqueClient.map((c) => c.nombre),
        })
        .getRawMany();
  
      for (const client of uniqueClient) {
        const existingClient = existingClients.find(
          (c) => c.nombre.localeCompare(client.nombre, undefined, { sensitivity: "base" }) === 0
        );
  
        if (existingClient) {
          let syncWithArray = existingClient.sync_with 
          ? (typeof existingClient.sync_with === "string" 
              ? JSON.parse(existingClient.sync_with) 
              : existingClient.sync_with) 
          : [];
  
          // 🔥 Verificar si ya existe el uuid en `sync_with`
          const alreadyExists = syncWithArray.some((entry: any) => entry.uuid_authsupa === uuid_authsupa);
  
          if (!alreadyExists) {
            syncWithArray.push({ id: client.id, uuid_authsupa });
  
            // 🔥 Actualizar `sync_with` correctamente
            await entityManager
              .createQueryBuilder()
              .update(`${schema}.clientes`)
              .set({ sync_with: () => `'${JSON.stringify(syncWithArray)}'::jsonb` }) // 🔥 Conversión segura a JSONB
              .where("nombre = :nombre", { nombre: existingClient.nombre })
              .execute();
          }
        }
      }
  
      await queryRunner.commitTransaction();
      return {
        message: "Sincronización completada",
        status: true
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error("❌ Error en syncTypeClient:", error);
      return {
        message: "¡La Sincronización ha fallado, retornando desde la base de datos!",
        status: false
      };
    } finally {
      await queryRunner.release();
    }
  }


};