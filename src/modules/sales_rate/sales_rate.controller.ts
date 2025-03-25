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
import { SalesRateService } from './sales_rate.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/role-check.guard';
import { SalesDtoArrayDto } from './dto/sales.dto';
import { AuthRequest } from '../../types';
import { LoggerServices } from '../logger/logger.service';

@Controller('sales-rate')
export class SalesRateController  {

constructor(
  private readonly salesServices: SalesRateService,
  private readonly logger: LoggerServices,
) {}

  /** ✅ Subir todos las tarifas no sincronizados desde el móbil (fontanero y admin) */
  @UseGuards(JwtAuthGuard, new RolesGuard([1,3]))
    @HttpCode(201)
    @UsePipes(new ValidationPipe({ whitelist: true })) 
  @Post('admin/post-all-salesRate')
    async submitAllSalesRate(@Req() request: AuthRequest,@Body() salesRateArray: SalesDtoArrayDto) {    
    try { 
      return await this.salesServices.submitAllSalesRate(request, salesRateArray.sales_rate);
    } catch (error) {
      const status = error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
      const response = error instanceof HttpException ? error.getResponse() : { message: 'Error interno', status: false };
      const errorMessage = typeof response === 'object' && 'message' in response ? response.message : 'Error desconocido';

      this.logger.error(
        `Error en SalesRateController.submitAllSalesRate - Status: ${status} - Mensaje: ${errorMessage}`,
        error.stack,
        request,
        status,
      );
      throw new HttpException(response, status);
    }
  }

  /** ✅ Obtener todos los tarifas no sincronizados desde el la base de datos (fontanero y admin) */
  @UseGuards(JwtAuthGuard, new RolesGuard([1,3]))
  @HttpCode(200)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Get('admin/get-all-salesRate')
    async getAllSalesRate(@Req() request: AuthRequest ) {  
    try {      
      return await this.salesServices.getAllSalesRate(request);
    } catch (error) {
      const status = error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
      const response = error instanceof HttpException ? error.getResponse() : { message: 'Error interno', status: false };
      const errorMessage = typeof response === 'object' && 'message' in response ? response.message : 'Error desconocido';

      this.logger.error(
        `Error en SalesRateController.getAllSalesRate - Status: ${status} - Mensaje: ${errorMessage}`,
        error.stack,
        request,
        status,
      );

      throw new HttpException(response, status);
    }
  }
  
    /** ✅ Tarifas sincronizados en móbil (fontanero y admin) */
  @UseGuards(JwtAuthGuard, new RolesGuard([1,3]))
  @Patch('admin/patch-sync-salesRate')
    async syncSalesRate(@Req() request: AuthRequest,@Body() salesRateArray: SalesDtoArrayDto ) {    
    try { 
      return await this.salesServices.syncSalesRate(request,salesRateArray.sales_rate);
    } catch (error) {
      const status = error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
      const response = error instanceof HttpException ? error.getResponse() : { message: 'Error interno', status: false };
      const errorMessage = typeof response === 'object' && 'message' in response ? response.message : 'Error desconocido';

      this.logger.error(
        `Error en SalesRateController.syncSalesRate - Status: ${status} - Mensaje: ${errorMessage}`,
        error.stack,
        request,
        status,
      );

      throw new HttpException(response, status);
    }
  }
}
