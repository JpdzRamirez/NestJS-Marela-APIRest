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
import { GetDateRangeInvoicesDto, InvoiceArrayDto } from './dto/invoice.dto';
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
      `Error en InvoiceController.getAllInvoices - Status: ${status} - Mensaje: ${errorMessage}`,
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

  try { 
    return await await this.invoiceServices.getDateRangeInvoices(request,dateParameters);
  } catch (error) {
    const status = error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const response = error instanceof HttpException ? error.getResponse() : { message: 'Error interno', status: false };
    const errorMessage = typeof response === 'object' && 'message' in response ? response.message : 'Error desconocido';

    this.logger.error(
      `Error en InvoiceController.getDateRangeInvoices - Status: ${status} - Mensaje: ${errorMessage}`,
      error.stack,
      request,
      status,
    );

    throw new HttpException(response, status);
  }
  }

    /** ✅ Subir todas las facturas no sincronizados desde el móbil (Solo admin) */
  @UseGuards(JwtAuthGuard, new RolesGuard([1,3]))
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @HttpCode(201)
  @Post('admin/post-all-invoices')
  async submitAllInvoices(@Req() request: AuthRequest,@Body() invoicesArray: InvoiceArrayDto ) {            
    try {
        return await this.invoiceServices.submitAllInvoices(request, invoicesArray.invoices);
    } catch (error) {
    const status = error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const response = error instanceof HttpException ? error.getResponse() : { message: 'Error interno', status: false };
    const errorMessage = typeof response === 'object' && 'message' in response ? response.message : 'Error desconocido';
  
    this.logger.error(
        `Error en InvoiceController.submitAllInvoices - Status: ${status} - Mensaje: ${errorMessage}`,
          error.stack,
          request,
          status,
    );
    throw new HttpException(response, status);
    }
  }

    /** ✅ Facturas sincronizados en móbil (Solo admin) */
    @UseGuards(JwtAuthGuard, new RolesGuard([1,3]))
    @UsePipes(new ValidationPipe({ whitelist: true }))
    @HttpCode(200)
    @Patch('admin/patch-sync-invoices')
      async syncContracts(@Req() request: AuthRequest,@Body() invoicesArray: InvoiceArrayDto ) {    
    try {
      return await this.invoiceServices.syncInvoices(request,invoicesArray.invoices);
    } catch (error) {
      const status = error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
      const response = error instanceof HttpException ? error.getResponse() : { message: 'Error interno', status: false };
      const errorMessage = typeof response === 'object' && 'message' in response ? response.message : 'Error desconocido';
    
      this.logger.error(
          `Error en InvoiceController.syncContracts - Status: ${status} - Mensaje: ${errorMessage}`,
            error.stack,
            request,
            status,
      );
      throw new HttpException(response, status);
      }
    }

}
