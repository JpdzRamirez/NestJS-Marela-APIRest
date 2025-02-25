import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InvoiceRepository } from './invoices.repository';
import { Invoice } from './invoice.entity';
import { GetDateRangeInvoicesDto } from './dto/get-dateRangeInvoices.dto';
import { AuthRequest } from '../../types';

@Injectable()
export class InvoiceServices {

  constructor(
    private readonly invoiceRepository: InvoiceRepository    
  ) {}

  /** ✅ Obtener todas las facturas*/
  async getAllInvoices(AuthRequest: AuthRequest): Promise<Invoice[]> {
    const user = AuthRequest.user;
    if (!user || !user.schemas || !user.schemas.name ) {
      throw new HttpException('Usuario sin acueducto', HttpStatus.NOT_FOUND);
    }

    const invoices = await this.invoiceRepository.getAllInvoices(user.schemas.name);

    if (!invoices) {
      throw new HttpException('Sin registros de facturas', HttpStatus.NOT_FOUND);
    }
    return invoices;
  }
  /** ✅ Obtener facturas dentro rangos de fecha */
  async getDateRangeInvoices(AuthRequest: AuthRequest,dateRange:GetDateRangeInvoicesDto): Promise<Invoice[]> {
    const user = AuthRequest.user;
    if (!user || !user.schemas || !user.schemas.name ) {
      throw new HttpException('Usuario sin acueducto', HttpStatus.NOT_FOUND);
    }

    const invoices = await this.invoiceRepository.getDateRangeInvoices(user.schemas.name,dateRange);

    if (!invoices) {
      throw new HttpException('Sin registros de facturas', HttpStatus.NOT_FOUND);
    }
    return invoices;
  }

}
