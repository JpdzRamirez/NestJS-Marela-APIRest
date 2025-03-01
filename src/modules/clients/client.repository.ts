import { Injectable } from '@nestjs/common';
import { InjectRepository,InjectDataSource  } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager, Between } from 'typeorm';
import { Client } from './client.entity';

import { PostAllClientsDto } from './dto/post-AllClients.dto';

@Injectable()
export class ClientRepository {
  constructor(    
    @InjectRepository(Client) private readonly clientRepository: Repository<Client>, // ✅ Inyectamos el repositorio de TypeORM
    @InjectDataSource() private readonly dataSource: DataSource
  ) {}

    /** ✅
     * Obtiene todas las facturas
     */
    async submitAllClients(schema: string, newClients: Client[]): Promise<Client[] | boolean> {
      try {
        return this.dataSource.manager.transaction(async (entityManager: EntityManager) => {
          // 🔥 Cambiar dinámicamente el esquema de las entidades principales
          entityManager.connection.getMetadata(Client).tablePath = `${schema}.clientes`;
    
          // Insertar todos los clientes en una sola operación
          const savedClients = await entityManager.save(Client, newClients);
          
          return savedClients;
        });
      } catch (error) {
        console.error('❌ Error en submit all clients:', error);
        return false;
      }
    }


};