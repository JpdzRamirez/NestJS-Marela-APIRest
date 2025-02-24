import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Factura } from '../facturas/factura.entity';


@Injectable()
export class FacturasRepository {
  constructor(    
    @InjectRepository(Factura) private readonly facturaRepository: Repository<Factura> // ✅ Inyectamos el repositorio de TypeORM
  ) {}

    /** ✅
     * Obtiene todas las facturas
     */
    async getAllInvoices(): Promise<Factura[]> {
      try {
        return await this.facturaRepository.find({ relations: ['contrato'] });
      } catch (error) {
        console.error('❌ Error en getAllUsers:', error);
        throw error;
      }
    }

};