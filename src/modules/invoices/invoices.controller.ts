import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Body,
    Req,
    UseGuards,
    HttpException,
    HttpStatus,
  } from '@nestjs/common';
import { InvoiceServices } from './invoices.service';
import { GetDateRangeInvoicesDto } from './dto/get-dateRangeInvoices.dto';

import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/role-check.guard';

import { AuthRequest } from '../../types';

@Controller('invoices')
export class InvoiceController {
constructor(private readonly invoiceServices: InvoiceServices) {}

  /** ✅ Obtener todas las facturas (Solo admin) */
  @UseGuards(JwtAuthGuard, new RolesGuard([1]))
  @Get('admin/get-all-invoices')
  async getAllInvoices(@Req() request: AuthRequest) {
    const invoices = await this.invoiceServices.getAllInvoices(request);
    if (!invoices.length) {
      throw new HttpException('No se encontraron facturas', HttpStatus.NOT_FOUND);
    }
    return invoices;
  }
  /** ✅ Obtener todas las facturas dentro de un rango de fechas (Solo admin) */
  @UseGuards(JwtAuthGuard, new RolesGuard([1]))
  @Get('admin/get-date-range-invoices')
  async getDateRangeInvoices(@Req() request: AuthRequest,@Body() dateParameters: GetDateRangeInvoicesDto) {
    const invoices = await this.invoiceServices.getDateRangeInvoices(request,dateParameters);
    if (!invoices.length) {
      throw new HttpException('No se encontraron facturas', HttpStatus.NOT_FOUND);
    }
    return invoices;
  }

}
