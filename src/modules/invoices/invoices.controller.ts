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
    HttpCode,
    UsePipes,
    ValidationPipe
  } from '@nestjs/common';
import { InvoiceServices } from './invoices.service';
import { GetDateRangeInvoicesDto } from './dto/get-dateRangeInvoices.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/role-check.guard';
import { AuthRequest } from '../../types';
import { LoggerServices } from '../logger/logger.service';

@Controller('invoices')
export class InvoiceController {
constructor(
  private readonly invoiceServices: InvoiceServices,
  private readonly logger: LoggerServices,
) {}

  /** ✅ Obtener todas las facturas (Solo admin) */
  @UseGuards(JwtAuthGuard, new RolesGuard([1]))
  @HttpCode(201)
  @UsePipes(new ValidationPipe({ whitelist: true })) 
  @Get('admin/get-all-invoices')
  async getAllInvoices(@Req() request: AuthRequest) {
  try { 
    return await this.invoiceServices.getAllInvoices(request);
  } catch (error) {
    const status = error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const response = error instanceof HttpException ? error.getResponse() : { message: 'Error interno', status: false };
    const errorMessage = typeof response === 'object' && 'message' in response ? response.message : 'Error desconocido';

    this.logger.error(
      `Error en StatesController.submitAllClients - Status: ${status} - Mensaje: ${errorMessage}`,
      error.stack,
      request,
      status,
    );
    throw new HttpException(response, status);
  }
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
