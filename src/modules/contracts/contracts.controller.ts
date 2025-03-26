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
    SetMetadata,
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
import { LoggerServices } from '../logger/logger.service';

@Controller('contracts')
export class ContractController {

    constructor(
      private readonly contractsServices: ContractServices,
      private readonly logger: LoggerServices,
    ) {}

  /** ✅ Obtener todos los conratos (Solo admin) */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetMetadata('roles', [1,3]) 
  @HttpCode(201)
  @UsePipes(new ValidationPipe({ whitelist: true })) 
  @Get('admin/get-all-contracts')
  async getAllContracts(@Req() request: AuthRequest) {
  try { 
    return await this.contractsServices.getAllContracts(request);
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

  /** ✅ Obtener todas los contratos dentro de un rango de fechas (Solo admin) */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetMetadata('roles', [1,3]) 
  @HttpCode(200)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Post('admin/get-date-range-contracts')
    async getDateRangeContracts(@Req() request: AuthRequest,@Body() dateParameters: GetDateRangeContractsDto) {
    try {    
      return await this.contractsServices.getDateRangeContracts(request,dateParameters);
    } catch (error) {
      const status = error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
      const response = error instanceof HttpException ? error.getResponse() : { message: 'Error interno', status: false };
      const errorMessage = typeof response === 'object' && 'message' in response ? response.message : 'Error desconocido';

      this.logger.error(
        `Error en ContractController.getDateRangeContracts - Status: ${status} - Mensaje: ${errorMessage}`,
        error.stack,
        request,
        status,
      );

      throw new HttpException(response, status);
    }
  }

  /** ✅ Subir todos los contratos no sincronizados desde el móbil (Solo admin) */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetMetadata('roles', [1,3]) 
  @HttpCode(201)
  @UsePipes(new ValidationPipe({ whitelist: true }))  
  @Post('admin/post-all-contracts')
  async submitAllContracts(@Req() request: AuthRequest,@Body() contractsArray: ContractsArrayDto ) {            
    try {
      return await this.contractsServices.submitAllContracts(request, contractsArray.contracts);
    } catch (error) {
      const status = error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
      const response = error instanceof HttpException ? error.getResponse() : { message: 'Error interno', status: false };
      const errorMessage = typeof response === 'object' && 'message' in response ? response.message : 'Error desconocido';

      this.logger.error(
        `Error en ContractController.submitAllContracts - Status: ${status} - Mensaje: ${errorMessage}`,
        error.stack,
        request,
        status,
      );
      throw new HttpException(response, status);
    }
  }
  

  /** ✅ Contratos sincronizados en móbil (Solo admin) */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetMetadata('roles', [1,3]) 
  @HttpCode(200)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Patch('admin/patch-sync-contracts')
    async syncContracts(@Req() request: AuthRequest,@Body() contractsArray: ContractsArrayDto ) {    
  try {
    return await this.contractsServices.syncContracts(request,contractsArray.contracts);
  } catch (error) {
    const status = error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const response = error instanceof HttpException ? error.getResponse() : { message: 'Error interno', status: false };
    const errorMessage = typeof response === 'object' && 'message' in response ? response.message : 'Error desconocido';
  
    this.logger.error(
        `Error en ContractController.syncContracts - Status: ${status} - Mensaje: ${errorMessage}`,
          error.stack,
          request,
          status,
    );
    throw new HttpException(response, status);
    }
  }

    
}
