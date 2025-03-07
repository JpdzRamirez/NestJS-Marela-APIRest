import { Injectable } from '@nestjs/common';
import { InjectRepository,InjectDataSource  } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager, Between } from 'typeorm';
import { TypeClient } from './type_client.entity';


@Injectable()
export class TypeClientRepository {
  constructor(    
    @InjectDataSource() private readonly dataSource: DataSource
  ) {}

    /** ✅
     * Guarda todas los tipos de clientes
     */
    async submitAllTypeClient(schema: string, newTypeClient: TypeClient[]): Promise<TypeClient[] | boolean> {
        const queryRunner = this.dataSource.createQueryRunner();
      
        await queryRunner.connect();
        await queryRunner.startTransaction();
      
        try {
          const entityManager = queryRunner.manager;
      
          // Insertar en la tabla con esquema dinámico
          const savedTypeClient = await entityManager
            .createQueryBuilder()
            .insert()
            .into(`${schema}.tipo_cliente`) // Se usa directamente el esquema aquí
            .values(newTypeClient)
            .execute();
      
          await queryRunner.commitTransaction();
          return true; 
        } catch (error) {
          await queryRunner.rollbackTransaction();
          console.error('❌ Error en submitAllTypeClient:', error);
          return false;
        } finally {
          await queryRunner.release();
        }
      }
      


};