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
      inserted: { id: number; id_client: number; nombre: string }[]     
    }>{
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
      
      const insertedClients: { id: number; id_client: number; nombre: string }[] = [];
      try {
        const entityManager = queryRunner.manager;
    
        // 🔥 Insertar los clientes con el esquema dinámico
        const savedClients = await entityManager
          .createQueryBuilder()
          .insert()
          .into(`${schema}.clientes`, [
            'id_client',
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
              id_client: tc.id_client,
              nombre: tc.nombre,
              apellido: tc.apellido,
              documento: tc.documento,
              correo: tc.correo,
              direccion: tc.direccion,
              telefono: tc.telefono,
              tipocliente_id: tc.tipo_cliente,
              tipodocumento_id: tc.tipo_documento,
              uploaded_by_authsupa: tc.uploaded_by_authsupa,
              sync_with: () => `'${JSON.stringify(tc.sync_with)}'::jsonb`, // 🔥 Convertir a JSONB
            }))
          )
          .returning(["id", "id_client", "nombre"]) 
          .execute();
          
        // 🔥 Asociar los nombres insertados con los IDs originales
        insertedClients.push(
          ...newClients.map((tc) => ({
              id: tc.id,
              id_client:tc.id_client,
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


};