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
import { TrailServices } from './trails.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/role-check.guard';
import { TrailArrayDto } from './dto/trail.dto';
import { AuthRequest } from '../../types';
import { LoggerServices } from '../logger/logger.service';

@Controller('trails')
export class TrailController {

constructor(
  private readonly trailServices: TrailServices,
  private readonly logger: LoggerServices,
) {}

  /** ✅ Subir todas las rutas no sincronizados desde el móbil (fontanero y admin) */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetMetadata('roles', [1,3]) 
  @HttpCode(201)
  @UsePipes(new ValidationPipe({ whitelist: true })) 
  @Post('admin/post-all-trails')
    async submitAllTrails(@Req() request: AuthRequest,@Body() trailsArray: TrailArrayDto) {    
    try {  
      return await this.trailServices.submitAllTrails(request, trailsArray.trails);
    } catch (error) {
      const status = error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
      const response = error instanceof HttpException ? error.getResponse() : { message: 'Error interno', status: false };
      const errorMessage = typeof response === 'object' && 'message' in response ? response.message : 'Error desconocido';
      // 🔹 Capturar detalles de la petición
      const { url, method, ip } = request;
      this.logger.error(
        error,
        `Error en TrailController.submitAllTrails - Status: ${status} - Método: ${method} - URL: ${url} - IP: ${ip}- Mensaje: ${errorMessage}`,
        request,
        status,
      );
      throw new HttpException(response, status);
    }
  }

  /** ✅ Obtener todos las Rutas no sincronizados desde el la base de datos (fontanero y admin) */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetMetadata('roles', [1,3]) 
  @HttpCode(200)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Get('admin/get-all-trails')
    async getAllTrails(@Req() request: AuthRequest ) {  
    try {   
      return await this.trailServices.getAllTrails(request);

    } catch (error) {
      const status = error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
      const response = error instanceof HttpException ? error.getResponse() : { message: 'Error interno', status: false };
      const errorMessage = typeof response === 'object' && 'message' in response ? response.message : 'Error desconocido';
      // 🔹 Capturar detalles de la petición
      const { url, method, ip } = request;
      this.logger.error(
        error,
        `Error en TrailController.submitAllTrails - Status: ${status} - Método: ${method} - URL: ${url} - IP: ${ip}- Mensaje: ${errorMessage}`,
        request,
        status,
      );

      throw new HttpException(response, status);
    }
  }
  
    /** ✅ Rutas sincronizados en móbil (fontanero y admin) */
    @UseGuards(JwtAuthGuard, RolesGuard)
  @SetMetadata('roles', [1,3]) 
  @HttpCode(201)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Patch('admin/patch-sync-trails')
    async syncTrails(@Req() request: AuthRequest,@Body() citiesArray: TrailArrayDto ) {    
    try {   
      return await this.trailServices.syncTrails(request,citiesArray.trails);
    } catch (error) {
      const status = error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
      const response = error instanceof HttpException ? error.getResponse() : { message: 'Error interno', status: false };
      const errorMessage = typeof response === 'object' && 'message' in response ? response.message : 'Error desconocido';
      // 🔹 Capturar detalles de la petición
      const { url, method, ip } = request;
      this.logger.error(
        error,
        `Error en TrailController.syncTrails - Status: ${status} - Método: ${method} - URL: ${url} - IP: ${ip}- Mensaje: ${errorMessage}`,
        request,
        status,
      );

      throw new HttpException(response, status);
    }
  }

}
