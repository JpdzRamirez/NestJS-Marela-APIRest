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
import { CityServices } from './cities.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/role-check.guard';
import { CitiesArrayDto } from './dto/cities.dto';
import { AuthRequest } from '../../types';
import { LoggerServices } from '../logger/logger.service';

@Controller('cities')
export class CitiesController {

constructor(
  private readonly citiesServices: CityServices,
  private readonly logger: LoggerServices,
) {}

  /** ✅ Subir todos las ciudades no sincronizados desde el móbil (fontanero y admin) */
  @UseGuards(JwtAuthGuard, new RolesGuard([1,3]))
  @HttpCode(201)
  @UsePipes(new ValidationPipe({ whitelist: true })) 
  @Post('admin/post-all-cities')
    async submitAllCities(@Req() request: AuthRequest,@Body() citiesArray: CitiesArrayDto) {    
    try { 
      return await this.citiesServices.submitAllCities(request, citiesArray.cities);
    } catch (error) {
      const status = error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
      const response = error instanceof HttpException ? error.getResponse() : { message: 'Error interno', status: false };
      const errorMessage = typeof response === 'object' && 'message' in response ? response.message : 'Error desconocido';

      this.logger.error(
        `Error en CitiesController.submitAllCities - Status: ${status} - Mensaje: ${errorMessage}`,
        error.stack,
        request,
        status,
      );
      throw new HttpException(response, status);
    }
  }

  /** ✅ Obtener todos las ciudades no sincronizados desde el la base de datos (fontanero y admin) */
  @UseGuards(JwtAuthGuard, new RolesGuard([1,3]))
  @HttpCode(200)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Get('admin/get-all-cities')
    async getAllCities(@Req() request: AuthRequest ) { 
    try {    
      return await this.citiesServices.getAllCities(request);
    } catch (error) {
      const status = error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
      const response = error instanceof HttpException ? error.getResponse() : { message: 'Error interno', status: false };
      const errorMessage = typeof response === 'object' && 'message' in response ? response.message : 'Error desconocido';

      this.logger.error(
        `Error en CitiesController.getAllCities - Status: ${status} - Mensaje: ${errorMessage}`,
        error.stack,
        request,
        status,
      );
      throw new HttpException(response, status);
    }
  }
  
    /** ✅ Cudades sincronizados en móbil (fontanero y admin) */
  @UseGuards(JwtAuthGuard, new RolesGuard([1,3]))
  @HttpCode(201)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Patch('admin/patch-sync-cities')
    async syncCities(@Req() request: AuthRequest,@Body() citiesArray: CitiesArrayDto ) {    
    try {  
      return await this.citiesServices.syncCities(request,citiesArray.cities);
    } catch (error) {
      const status = error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
      const response = error instanceof HttpException ? error.getResponse() : { message: 'Error interno', status: false };
      const errorMessage = typeof response === 'object' && 'message' in response ? response.message : 'Error desconocido';

      this.logger.error(
        `Error en StatesController.syncClients - Status: ${status} - Mensaje: ${errorMessage}`,
        error.stack,
        request,
        status,
      );

      throw new HttpException(response, status);
    }
  }

}
