import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { FacturasRepository } from '../facturas/facturas.repository';
import { Factura } from './factura.entity';

@Injectable()
export class FacturasServices {

  constructor(
    private readonly facturaRepository: FacturasRepository    
  ) {}

  /** ✅ Obtener usuario por ID */
  async getAllInvoices(): Promise<Factura[]> {
    const invoices = await this.facturaRepository.getAllInvoices();
    if (!invoices) {
      throw new HttpException('Sin registros de facturas', HttpStatus.NOT_FOUND);
    }
    return invoices;
  }


}
