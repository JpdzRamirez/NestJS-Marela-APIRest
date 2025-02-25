import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from './invoice.entity';

import { GetDateRangeInvoicesDto } from './dto/get-dateRangeInvoices.dto';

@Injectable()
export class InvoiceRepository {
  constructor(    
    @InjectRepository(Invoice) private readonly invoiceRepository: Repository<Invoice> // ✅ Inyectamos el repositorio de TypeORM
  ) {}

    /** ✅
     * Obtiene todas las facturas
     */
    async getAllInvoices(schema: string): Promise<Invoice[]> {
      try {
        return await this.invoiceRepository
          .createQueryBuilder('factura')
          .from(`${schema}.facturas`, 'facturas')
          .innerJoinAndSelect('facturas.contrato', 'contrato')
          .getRawMany(); 
      } catch (error) {
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

            return await this.invoiceRepository
              .createQueryBuilder('factura')
              .from(`${schema}.facturas`, 'facturas')
              .innerJoinAndSelect('facturas.contrato', 'contrato')
              .where('facturas.fecha_lectura BETWEEN :start AND :end', { start: startDate, end: endDate })
              .getRawMany(); 
          } catch (error) {
            console.error('❌ Error en getAllInvoices:', error);
            throw error;
          }
    }

};