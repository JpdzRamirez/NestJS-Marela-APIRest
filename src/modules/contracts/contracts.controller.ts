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
    UsePipes,
    HttpCode,
    ValidationPipe
} from '@nestjs/common';
import { ContractServices } from './contracts.service';
import { GetDateRangeContractsDto,ContractsArrayDto } from './dto/contracts.dto';

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
    return await this.contractsServices.getAllContracts(request);
  }

  /** ✅ Obtener todas los contratos dentro de un rango de fechas (Solo admin) */
  @UseGuards(JwtAuthGuard, new RolesGuard([1]))
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Post('admin/get-date-range-contracts')
    async getDateRangeInvoices(@Req() request: AuthRequest,@Body() dateParameters: GetDateRangeContractsDto) {
      return await this.contractsServices.getDateRangeContracts(request,dateParameters);
  }

  /** ✅ Subir todos los contratos no sincronizados desde el móbil (Solo admin) */
  @UseGuards(JwtAuthGuard, new RolesGuard([1,3]))
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @HttpCode(201)
  @Post('admin/post-all-contracts')
  async submitAllContracts(@Req() request: AuthRequest,@Body() contractsArray: ContractsArrayDto ) {            
    try {
      const result = await this.contractsServices.submitAllContracts(request, contractsArray.contracts);
      
      if (!result.status) {
        throw new HttpException('Error al procesar los contratos', HttpStatus.BAD_REQUEST); // 400
      }

      return result;
    } catch (error) {
      throw new HttpException(error.message || 'Error interno', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  

  /** ✅ Contratos sincronizados en móbil (Solo admin) */
  @UseGuards(JwtAuthGuard, new RolesGuard([1,3]))
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @HttpCode(200)
  @Patch('admin/patch-sync-contracts')
    async syncContracts(@Req() request: AuthRequest,@Body() contractsArray: ContractsArrayDto ) {    
    return await this.contractsServices.syncContracts(request,contractsArray.contracts);
  }

    
}
