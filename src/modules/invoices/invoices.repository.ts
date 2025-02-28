import { Injectable } from '@nestjs/common';
import { InjectRepository,InjectDataSource  } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager, Between } from 'typeorm';
import { Invoice } from './invoice.entity';

import { GetDateRangeInvoicesDto } from './dto/get-dateRangeInvoices.dto';

@Injectable()
export class InvoiceRepository {
  constructor(    
    @InjectRepository(Invoice) private readonly invoiceRepository: Repository<Invoice>, // ✅ Inyectamos el repositorio de TypeORM
    @InjectDataSource() private readonly dataSource: DataSource
  ) {}

    /** ✅
     * Obtiene todas las facturas
     */
    async getAllInvoices(schema: string): Promise<Invoice[]> {
      try {
            return this.dataSource.manager.transaction(async (entityManager: EntityManager) => {
              // 🔥 Cambiar dinámicamente el esquema de las entidades principales
              entityManager.connection.getMetadata(Invoice).tablePath = `${schema}.facturas`;    
          
              return await entityManager.find(Invoice, {
                relations: [
                  'contrato',
                  'usuario'
                ],
              });
            });
          }catch (error) {
            console.error('❌ Error en getAllInvoices:', error);
            throw error;
        }
    }
    /** ✅
     * Obtiene todas las facturas dentro del rango de fechas
     */
    async getDateRangeInvoices(schema: string, dateRange:GetDateRangeInvoicesDto): Promise<Invoice[]> {
          try {

            const { startDate, endDate } = dateRange; 

            return this.dataSource.manager.transaction(async (entityManager: EntityManager) => {
              // 🔥 Cambiar dinámicamente el esquema de las entidades principales
              entityManager.connection.getMetadata(Invoice).tablePath = `${schema}.facturas`;    
          
              return await entityManager.find(Invoice, {
                where: {
                  fecha_lectura: Between(startDate, endDate), // Filtra por rango de fechas
                },    
                relations: [
                  'contrato',
                  'usuario'
                ],
              });
            });
          } catch (error) {
            console.error('❌ Error en getAllInvoices:', error);
            throw error;
          }
    }

};