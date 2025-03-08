import { Injectable } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager, Between } from 'typeorm';
import { TypeClient } from './type_client.entity';

@Injectable()
export class TypeClientRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  /** ✅
   * Guarda todas los tipos de clientes
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
        const result = await entityManager
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
}
