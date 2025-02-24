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
import { FacturasServices } from './facturas.service';
import { GetFacturaDto } from './dto/get-factura.dto';

import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/role-check.guard';

@Controller('facturas')
export class FacturasController {
constructor(private readonly facturasServices: FacturasServices) {}

  /** ✅ Obtener todos los usuarios (Solo admin) */
  @UseGuards(JwtAuthGuard, new RolesGuard([1]))
  @Get('admin/get-all-invoices')
  async getAllInvoices() {
    const invoices = await this.facturasServices.getAllInvoices();
    if (!invoices.length) {
      throw new HttpException('No se encontraron usuarios', HttpStatus.NOT_FOUND);
    }
    return invoices;
  }

}
