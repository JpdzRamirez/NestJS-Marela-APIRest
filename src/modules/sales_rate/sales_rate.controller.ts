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
import { SalesRateService } from './sales_rate.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/role-check.guard';

import { SalesDtoArrayDto } from './dto/sales.dto';

import { AuthRequest } from '../../types';

@Controller('sales-rate')
export class SalesRateController  {

constructor(private readonly salesServices: SalesRateService) {}

  /** ✅ Subir todos los clientes no sincronizados desde el móbil (fontanero y admin) */
  @UseGuards(JwtAuthGuard, new RolesGuard([1,3]))
  @Post('admin/post-all-salesRate')
    async submitAllSalesRate(@Req() request: AuthRequest,@Body() salesRateArray: SalesDtoArrayDto) {    
      return await this.salesServices.submitAllSalesRate(request, salesRateArray.sales_rate);
  }

  /** ✅ Obtener todos los tarifas no sincronizados desde el la base de datos (fontanero y admin) */
  @UseGuards(JwtAuthGuard, new RolesGuard([1,3]))
  @Get('admin/get-all-salesRate')
    async getAllSalesRate(@Req() request: AuthRequest ) {    
      return await this.salesServices.getAllSalesRate(request);
  }
  
    /** ✅ Tarifas sincronizados en móbil (fontanero y admin) */
  @UseGuards(JwtAuthGuard, new RolesGuard([1,3]))
  @Patch('admin/patch-sync-salesRate')
    async syncSalesRate(@Req() request: AuthRequest,@Body() salesRateArray: SalesDtoArrayDto ) {    
      return await this.salesServices.syncSalesRate(request,salesRateArray.sales_rate);
  }
}
