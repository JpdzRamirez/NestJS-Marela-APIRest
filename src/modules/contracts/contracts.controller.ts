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
import { ContractServices } from './contracts.service';
import { GetDateRangeContractsDto } from './dto/get-dateRangeContracts.dto';

import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/role-check.guard';

import { AuthRequest } from '../../types';
@Controller('contracts')
export class ContractController {

    constructor(private readonly contractsServices: ContractServices) {}

  /** ✅ Obtener todos los conratos (Solo admin) */
  @UseGuards(JwtAuthGuard, new RolesGuard([1]))
  @Get('admin/get-all-contracts')
  async getAllContracts(@Req() request: AuthRequest) {
    const contracts = await this.contractsServices.getAllContracts(request);
    if (!contracts.length) {
      throw new HttpException('No se encontraron contratos', HttpStatus.NOT_FOUND);
    }
    return contracts;
  }

  /** ✅ Obtener todas los contratos dentro de un rango de fechas (Solo admin) */
  @UseGuards(JwtAuthGuard, new RolesGuard([1]))
  @Get('admin/get-date-range-contracts')
    async getDateRangeInvoices(@Req() request: AuthRequest,@Body() dateParameters: GetDateRangeContractsDto) {
      const invoices = await this.contractsServices.getDateRangeContracts(request,dateParameters);
      if (!invoices.length) {
        throw new HttpException('No se encontraron facturas', HttpStatus.NOT_FOUND);
      }
      return invoices;
  }

    
}
