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
import { OverdueDebtService } from './overdue_debt.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/role-check.guard';
import { OverdueDebtArrayDto } from './dto/overdue_debt.dto';
import { AuthRequest } from '../../types';
import { LoggerServices } from '../logger/logger.service';

@Controller('overdue-debt')
export class OverdueDebtController {

    
    constructor(
      private readonly overdueDebtServices: OverdueDebtService,
      private readonly logger: LoggerServices,
    ) {}
    
      /** ✅ Subir todos las moras no sincronizados desde el móbil (fontanero y admin) */
      @UseGuards(JwtAuthGuard, new RolesGuard([1,3]))
      @HttpCode(201)
      @UsePipes(new ValidationPipe({ whitelist: true })) 
      @Post('admin/post-all-overdueDebt')
        async submitAllOverdueDebt(@Req() request: AuthRequest,@Body() overDueDebtArray: OverdueDebtArrayDto) {    
        try { 
          return await this.overdueDebtServices.submitAllOverdueDebt(request, overDueDebtArray.cities);
        } catch (error) {
          const status = error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
          const response = error instanceof HttpException ? error.getResponse() : { message: 'Error interno', status: false };
          const errorMessage = typeof response === 'object' && 'message' in response ? response.message : 'Error desconocido';
    
          this.logger.error(
            `Error en OverdueDebtController.submitAllOverdueDebt - Status: ${status} - Mensaje: ${errorMessage}`,
            error.stack,
            request,
            status,
          );
          throw new HttpException(response, status);
        }
      }
    
      /** ✅ Obtener todos las moras no sincronizados desde el la base de datos (fontanero y admin) */
      @UseGuards(JwtAuthGuard, new RolesGuard([1,3]))
      @HttpCode(200)
      @UsePipes(new ValidationPipe({ whitelist: true }))
      @Get('admin/get-all-overdueDebt')
        async getAllOverdueDebt(@Req() request: AuthRequest ) { 
        try {    
          return await this.overdueDebtServices.getAllOverdueDebt(request);
        } catch (error) {
          const status = error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
          const response = error instanceof HttpException ? error.getResponse() : { message: 'Error interno', status: false };
          const errorMessage = typeof response === 'object' && 'message' in response ? response.message : 'Error desconocido';
    
          this.logger.error(
            `Error en OverdueDebtController.getAllOverdueDebt - Status: ${status} - Mensaje: ${errorMessage}`,
            error.stack,
            request,
            status,
          );
          throw new HttpException(response, status);
        }
      }
      
        /** ✅ Moras sincronizados en móbil (fontanero y admin) */
      @UseGuards(JwtAuthGuard, new RolesGuard([1,3]))
      @HttpCode(201)
      @UsePipes(new ValidationPipe({ whitelist: true }))
      @Patch('admin/patch-sync-overdueDebt')
        async syncOverdueDebt(@Req() request: AuthRequest,@Body() overDueDebtArray: OverdueDebtArrayDto ) {    
        try {  
          return await this.overdueDebtServices.syncOverdueDebt(request,overDueDebtArray.cities);
        } catch (error) {
          const status = error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
          const response = error instanceof HttpException ? error.getResponse() : { message: 'Error interno', status: false };
          const errorMessage = typeof response === 'object' && 'message' in response ? response.message : 'Error desconocido';
    
          this.logger.error(
            `Error en OverdueDebtController.getAllOverdueDebt - Status: ${status} - Mensaje: ${errorMessage}`,
            error.stack,
            request,
            status,
          );
    
          throw new HttpException(response, status);
        }
      }
    
}
