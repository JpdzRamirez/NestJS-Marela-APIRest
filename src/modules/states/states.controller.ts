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
import { StatesService } from './states.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/role-check.guard';
import { StatesArrayDto } from './dto/state.dto';
import { AuthRequest } from '../../types';
import { LoggerServices } from '../logger/logger.service';

@Controller('states')
export class StatesController {

constructor(
  private readonly stateServices: StatesService,
  private readonly logger: LoggerServices,
) {}

  /** ✅ Subir todos los departamentos no sincronizados desde el móbil (fontanero y admin) */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetMetadata('roles', [1,3]) 
  @HttpCode(201)
  @UsePipes(new ValidationPipe({ whitelist: true })) 
  @Post('admin/post-all-states')
    async submitAllStates(@Req() request: AuthRequest,@Body() statesArray: StatesArrayDto) {  
    try {  
      return await this.stateServices.submitAllStates(request, statesArray.states);
    } catch (error) {
      const status = error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
      const response = error instanceof HttpException ? error.getResponse() : { message: 'Error interno', status: false };
      const errorMessage = typeof response === 'object' && 'message' in response ? response.message : 'Error desconocido';
      // 🔹 Capturar detalles de la petición
      const { url, method, ip } = request;
      this.logger.error(
        error,
        `Error en StatesController.submitAllStates - Status: ${status} - Método: ${method} - URL: ${url} - IP: ${ip}- Mensaje: ${errorMessage}`,
        request,
        status,
      );
      throw new HttpException(response, status);
    }
  }

  /** ✅ Obtener todos los departamentos no sincronizados desde el la base de datos (fontanero y admin) */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetMetadata('roles', [1,3]) 
  @HttpCode(200)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Get('admin/get-all-states')
    async getAllStates(@Req() request: AuthRequest ) { 
    try {    
      return await this.stateServices.getAllStates(request);
    } catch (error) {
      const status = error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
      const response = error instanceof HttpException ? error.getResponse() : { message: 'Error interno', status: false };
      const errorMessage = typeof response === 'object' && 'message' in response ? response.message : 'Error desconocido';
      // 🔹 Capturar detalles de la petición
      const { url, method, ip } = request;
      this.logger.error(
        error,
        `Error en StatesController.getAllStates - Status: ${status} - Método: ${method} - URL: ${url} - IP: ${ip}- Mensaje: ${errorMessage}`,
        request,
        status,
      );

      throw new HttpException(response, status);
    }
  }
  
    /** ✅ Departamentos sincronizados en móbil (fontanero y admin) */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetMetadata('roles', [1,3]) 
  @HttpCode(201)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Patch('admin/patch-sync-states')
    async syncStates(@Req() request: AuthRequest,@Body() citiesArray: StatesArrayDto ) { 
    try {   
      return await this.stateServices.syncStates(request,citiesArray.states);
    } catch (error) {
      const status = error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
      const response = error instanceof HttpException ? error.getResponse() : { message: 'Error interno', status: false };
      const errorMessage = typeof response === 'object' && 'message' in response ? response.message : 'Error desconocido';
      // 🔹 Capturar detalles de la petición
      const { url, method, ip } = request;

      this.logger.error(
        error,
        `Error en StatesController.syncStates - Status: ${status} - Método: ${method} - URL: ${url} - IP: ${ip}- Mensaje: ${errorMessage}`,
        request,
        status,
      );

      throw new HttpException(response, status);
    }
  }

}
