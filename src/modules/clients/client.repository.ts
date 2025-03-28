import { Injectable,HttpException,HttpStatus } from '@nestjs/common';
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
     * Inserta todos los clientes y retorna los clientes insertados o duplicados
     */
    async submitAllClients(
      schema: string, 
      clientsArrayFiltred: { uniqueClients: Client[]; duplicateClients: ClientsDto[] }
    ): Promise<{ 
      message: string,
      status: boolean,
      inserted: { 
        id: number; 
        id_cliente: string;
        nombre: string ;
        apellido: string | null;
        documento: string;
      }[];
      duplicated: ClientsDto[]; 
      existing:ClientsDto[];
    }>{
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const insertedClients: { 
        id: number; 
        id_cliente: string;
        nombre: string;        
        apellido: string | null; 
        documento: string; 
       }[] = [];
      const duplicateClients=clientsArrayFiltred.duplicateClients;
      const syncronizedClients: ClientsDto[] = [];
      const uniqueFilteredClients = new Map<string, Client>();
      try {
        const entityManager = queryRunner.manager;
        
        // 🔥 Obtener clientes que ya existen en la base de datos
        const existingClients= await entityManager
        .createQueryBuilder()
        .select(['id', 'documento'])
        .from(`${schema}.clientes`, 'clientes')
        .where('clientes.documento IN (:...documento)', {
          documento: clientsArrayFiltred.uniqueClients.map((tc) => tc.documento.toString()),
        })
        .getRawMany();

        for (const cliente of clientsArrayFiltred.uniqueClients) {
        
            const referenceKey = cliente.id_cliente.toString().trim();
        
              if (existingClients.some((wm) => wm.documento === cliente.documento)) {
                let duplicatedDBClient:ClientsDto = {
                      id:cliente.id,
                      id_cliente:cliente.id_cliente,
                      nombre:cliente.nombre,
                      apellido:cliente.apellido ?? null,
                      correo:cliente.correo,
                      numeroDocumento:cliente.documento,
                      telefono:cliente.telefono,
                      direccion:cliente.direccion,                      
                      tipoDocumento:cliente.tipo_documento.id_tipodocumento,
                      tipoCliente:cliente.tipo_cliente.id_tipocliente,
                      unidadMunicipal:cliente.unidad_municipal.id_unidadmunicipal,
                      source_failure:'DataBase'
                  };
                  syncronizedClients.push({ ...duplicatedDBClient }); // Guardar duplicado
              }else {
                uniqueFilteredClients.set(referenceKey, { ...cliente });
              }
        }
        if (uniqueFilteredClients.size  > 0) {
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
            'unidad_municipal_id',
            'uploaded_by_authsupa', 
            'sync_with'])
          .values(
            Array.from(uniqueFilteredClients.values()).map((cl) => ({
              id_cliente: cl.id_cliente,              
              nombre: cl.nombre,
              apellido: cl.apellido,
              documento: cl.documento,
              correo: cl.correo,
              direccion: cl.direccion,
              telefono: cl.telefono,
              tipocliente_id: cl.tipo_cliente.id_tipocliente,          
              tipodocumento_id: cl.tipo_documento.id_tipodocumento,     
              unidad_municipal_id: cl.unidad_municipal.id_unidadmunicipal,                         
              uploaded_by_authsupa: cl.uploaded_by_authsupa,
              sync_with: () => `'${JSON.stringify(cl.sync_with)}'::jsonb`, // 🔥 Convertir a JSONB
            }))
          )
          .returning(["id", "id_cliente", "nombre"]) 
          .execute();
          
        // 🔥 Asociar los nombres insertados con los IDs originales
        insertedClients.push(
          ...Array.from(uniqueFilteredClients.values()).map((cl) => ({
            id: cl.id, 
            id_cliente: cl.id_cliente,
            nombre:cl.nombre,
            apellido: cl.apellido ?? null,
            documento: cl.documento,
          }))
        );                 
        }else{                      
          throw new HttpException('La base de datos ya se encuentra sincronizada; Datos ya presentes en BD', HttpStatus.CONFLICT);
        }

        await queryRunner.commitTransaction();

        return {
          message: "Cargue exitoso, se han obtenido los siguientes resultados:",
          status: true,
          inserted: insertedClients, 
          duplicated: duplicateClients,
          existing:syncronizedClients
        };
      } catch (error) {
        await queryRunner.rollbackTransaction();
        console.error("❌ Error en submitAllClients:", error);
        
        return {
          message: `¡El cargue ha terminado! -> ${error.message || 'Error desconocido'}`,      
          status: false,
          inserted: [],
          duplicated: duplicateClients,
          existing:syncronizedClients
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
    status:boolean,
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
          'Conexión exitosa, se han obtenido los siguientes clientes no sincronizados:',
        status:true,
        clients: notSyncTypeClient
      };
    } catch (error) {

      await queryRunner.rollbackTransaction();      

      return {
        message: "¡Error en la conexión, retornando desde la base de datos!! -> "+ error.message, 
        status:false,
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
    clientArrayFiltred:  { uniqueClients: ClientsDto[]; duplicateClients: ClientsDto[] }
  ): Promise<{
    message: string,
    status: boolean,
    syncronized: ClientsDto[],
    duplicated: ClientsDto[] | null;
  }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const syncronized : ClientsDto[] = [];
  
    try {
      const entityManager = queryRunner.manager;      
      
      if(clientArrayFiltred.uniqueClients.length>0){  
      // 🔥 Obtener todos los registros existentes que coincida con la lista filtrada
      const existingClients = await entityManager
        .createQueryBuilder()
        .select("clientes.*")
        .from(`${schema}.clientes`, "clientes")
        .where('clientes.documento IN (:...documentos)', {
          documentos: clientArrayFiltred.uniqueClients.map((tc) => tc.numeroDocumento.toString()),
      })
      .getRawMany();
  
      for (const client of clientArrayFiltred.uniqueClients) {

        const existingClient = existingClients.find(
          (c) => c.numeroDocumento.localeCompare(client.numeroDocumento, undefined, { sensitivity: "base" }) === 0
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
              .where("id_cliente = :id_cliente", { id_cliente: existingClient.id_cliente })
              .execute();

              syncronized.push({ ...existingClient });
          }
        }
      }
      }

      if(syncronized.length ===0){
        throw new HttpException('La base de datos ya se encuentra sincronizada; Datos ya presentes en BD', HttpStatus.CONFLICT);
      }
      
      await queryRunner.commitTransaction();

      return {
        message: "Sincronización exitosa, se han obtenido los siguientes resultados",
        status: true,
        syncronized:syncronized,
        duplicated: clientArrayFiltred.duplicateClients,
      };
    } catch (error) {

      await queryRunner.rollbackTransaction();
      
      return {
        message: `¡La Sincronización ha terminado, retornando desde syncStates !! -> ${error.message || 'Error desconocido'}`, 
        status: false,
        syncronized:syncronized,
        duplicated: clientArrayFiltred.duplicateClients,
      };
    } finally {
      await queryRunner.release();
    }
  }


};