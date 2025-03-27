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
import { WaterMeterService } from './meters.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/role-check.guard';
import { WaterMetersArrayDto  } from './dto/meters.dto';
import { AuthRequest } from '../../types';
import { LoggerServices } from '../logger/logger.service';

@Controller('water-meter')
export class WaterMeterController {

    constructor(
      private readonly waterMeterServices: WaterMeterService,
      private readonly logger: LoggerServices,
    ) {}
    
      /** ✅ Subir todos los tipos de medidores de agua no sincronizados desde el móbil (Solo admin) */
      @UseGuards(JwtAuthGuard, RolesGuard)
      @SetMetadata('roles', [1,3]) 
      @HttpCode(201)
      @UsePipes(new ValidationPipe({ whitelist: true })) 
      @Post('admin/post-all-waterMeters')
      async submitAllWaterMeter(@Req() request: AuthRequest,@Body() waterMetersArray: WaterMetersArrayDto ) {    
      try {  
          return await this.waterMeterServices.submitAllWaterMeter(request, waterMetersArray.water_meters);
      } catch (error) {
          const status = error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
          const response = error instanceof HttpException ? error.getResponse() : { message: 'Error interno', status: false };
          const errorMessage = typeof response === 'object' && 'message' in response ? response.message : 'Error desconocido';

          // 🔹 Capturar detalles de la petición
          const { url, method, ip } = request;

          this.logger.error(
            error,
            `Error en WaterMeterController.submitAllWaterMeter - Status: ${status} - Método: ${method} - URL: ${url} - IP: ${ip}- Mensaje: ${errorMessage}`,
            request,
            status,
          );
          throw new HttpException(response, status);
      }
      }
    
      /** ✅ Obtener todos los medidores de agua no sincronizados desde el la base de datos (Solo admin) */
      @UseGuards(JwtAuthGuard, RolesGuard)
      @SetMetadata('roles', [1,3]) 
      @HttpCode(200)
      @UsePipes(new ValidationPipe({ whitelist: true }))
      @Get('admin/get-all-waterMeters')
      async getAllWaterMeters(@Req() request: AuthRequest ) {    
        try {  
          return await this.waterMeterServices.getAllWaterMeters(request);
        } catch (error) {
          const status = error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
          const response = error instanceof HttpException ? error.getResponse() : { message: 'Error interno', status: false };
          const errorMessage = typeof response === 'object' && 'message' in response ? response.message : 'Error desconocido';

          // 🔹 Capturar detalles de la petición
          const { url, method, ip } = request;

          this.logger.error(
            error,
            `Error en WaterMeterController.getAllWaterMeters - Status: ${status} - Método: ${method} - URL: ${url} - IP: ${ip}- Mensaje: ${errorMessage}`,
            request,
            status,
          );
    
          throw new HttpException(response, status);
        }
      }
    
      /** ✅ Medidores de agua sincronizados en móbil (Solo admin) */
      @UseGuards(JwtAuthGuard, RolesGuard)
      @SetMetadata('roles', [1,3])
      @HttpCode(201)
      @UsePipes(new ValidationPipe({ whitelist: true }))
      @Patch('admin/patch-sync-waterMeters')
        async syncWaterMeters(@Req() request: AuthRequest,@Body() waterMetersArray: WaterMetersArrayDto ) {    
      try {   
        return await this.waterMeterServices.syncWaterMeters(request,waterMetersArray.water_meters);
      } catch (error) {
        const status = error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
        const response = error instanceof HttpException ? error.getResponse() : { message: 'Error interno', status: false };
        const errorMessage = typeof response === 'object' && 'message' in response ? response.message : 'Error desconocido';

        // 🔹 Capturar detalles de la petición
        const { url, method, ip } = request;

        this.logger.error(
          error,
          `Error en WaterMeterController.syncWaterMeters - Status: ${status} - Método: ${method} - URL: ${url} - IP: ${ip}- Mensaje: ${errorMessage}`,
          request,
          status,
        );
  
        throw new HttpException(response, status);
      }
      }
    
    }
    
