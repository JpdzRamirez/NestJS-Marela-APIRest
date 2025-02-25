import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contract } from './contract.entity';

import { GetDateRangeContractsDto } from './dto/get-dateRangeContracts.dto';

@Injectable()
export class ContractRepository {
  constructor(    
    @InjectRepository(Contract) private readonly contratoRepository: Repository<Contract> // ✅ Inyectamos el repositorio de TypeORM
  ) {}

    /** ✅
     * Obtiene todos las contratos junto sus facturas
    */
    async getAllContracts(schema: string): Promise<Contract[]> {
      try {
        return await this.contratoRepository
          .createQueryBuilder('contrato')
          .from(`${schema}.contratos`, 'contratos')
          .innerJoinAndSelect('contratos.facturas', 'factura')
          .getRawMany(); 
      } catch (error) {
        console.error('❌ Error en getAllInvoices:', error);
        throw error;
      }
    }
        /** ✅
         * Obtiene todas las facturas dentro del rango de fechas
         */
    async getDateRangeContracts(schema: string, dateRange:GetDateRangeContractsDto): Promise<Contract[]> {
      try {
    
        const { startDate, endDate } = dateRange; 
    
        return await this.contratoRepository
          .createQueryBuilder('factura')
          .from(`${schema}.contratos`, 'contratos')
          .innerJoinAndSelect('contratos.contrato', 'contrato')
          .where('contratos.fecha BETWEEN :start AND :end', { start: startDate, end: endDate })
          .getRawMany(); 
      }catch (error) {
        console.error('❌ Error en getAllInvoices:', error);
        throw error;
    }
  }

};