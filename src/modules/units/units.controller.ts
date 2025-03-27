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
    HttpCode,
    UsePipes,
    ValidationPipe
  } from '@nestjs/common';
import { UnitsService } from './units.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/role-check.guard';
import { UnitsArrayDto } from './dto/units.dto';
import { AuthRequest } from '../../types';
import { LoggerServices } from '../logger/logger.service';

@Controller('units')
export class UnitsController {

    
constructor(
    private readonly unitsServices: UnitsService,
    private readonly logger: LoggerServices,
  ) {}
  
    /** ✅ Subir todos las unidades no sincronizados desde el móbil (fontanero y admin) */
    @UseGuards(JwtAuthGuard, RolesGuard)
    @SetMetadata('roles', [1,3]) 
    @HttpCode(201)
    @UsePipes(new ValidationPipe({ whitelist: true })) 
    @Post('admin/post-all-units')
      async submitAllUnits(@Req() request: AuthRequest,@Body() unitsArray: UnitsArrayDto) {    
      try { 
        return await this.unitsServices.submitAllUnits(request, unitsArray.units);
      } catch (error) {
        const status = error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
        const response = error instanceof HttpException ? error.getResponse() : { message: 'Error interno', status: false };
        const errorMessage = typeof response === 'object' && 'message' in response ? response.message : 'Error desconocido';
      // 🔹 Capturar detalles de la petición
      const { url, method, ip } = request;  
        this.logger.error(
          error,
          `Error en UnitsController.submitAllUnits - Status: ${status} - Método: ${method} - URL: ${url} - IP: ${ip}- Mensaje: ${errorMessage}`,
          request,
          status,
        );
        throw new HttpException(response, status);
      }
    }
  
    /** ✅ Obtener todos las unidades no sincronizados desde el la base de datos (fontanero y admin) */
    @UseGuards(JwtAuthGuard, RolesGuard)
    @SetMetadata('roles', [1,3]) 
    @HttpCode(200)
    @UsePipes(new ValidationPipe({ whitelist: true }))
    @Get('admin/get-all-units')
      async getAllUnits(@Req() request: AuthRequest ) { 
      try {    
        return await this.unitsServices.getAllUnits(request);
      } catch (error) {
        const status = error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
        const response = error instanceof HttpException ? error.getResponse() : { message: 'Error interno', status: false };
        const errorMessage = typeof response === 'object' && 'message' in response ? response.message : 'Error desconocido';
      // 🔹 Capturar detalles de la petición
      const { url, method, ip } = request;  
        this.logger.error(
          error,
          `Error en UnitsController.getAllUnits - Status: ${status} - Método: ${method} - URL: ${url} - IP: ${ip}- Mensaje: ${errorMessage}`,
          request,
          status,
        );
        throw new HttpException(response, status);
      }
    }
    
      /** ✅ Unidades sincronizados en móbil (fontanero y admin) */
    @UseGuards(JwtAuthGuard, RolesGuard)
    @SetMetadata('roles', [1,3]) 
    @HttpCode(201)
    @UsePipes(new ValidationPipe({ whitelist: true }))
    @Patch('admin/patch-sync-units')
      async syncUnits(@Req() request: AuthRequest,@Body() unitsArray: UnitsArrayDto ) {    
      try {  
        return await this.unitsServices.syncUnits(request,unitsArray.units);
      } catch (error) {
        const status = error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
        const response = error instanceof HttpException ? error.getResponse() : { message: 'Error interno', status: false };
        const errorMessage = typeof response === 'object' && 'message' in response ? response.message : 'Error desconocido';
        // 🔹 Capturar detalles de la petición
        const { url, method, ip } = request;  

        this.logger.error(
          error,
          `Error en UnitsController.syncUnits - Status: ${status} - Método: ${method} - URL: ${url} - IP: ${ip}- Mensaje: ${errorMessage}`,
          request,
          status,
        );
  
        throw new HttpException(response, status);
      }
    }

}
