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
import { CityServices } from './cities.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/role-check.guard';

import { CitiesArrayDto } from './dto/cities.dto';

import { AuthRequest } from '../../types';

@Controller('cities')
export class CitiesController {

constructor(private readonly citiesServices: CityServices) {}

  /** ✅ Subir todos los clientes no sincronizados desde el móbil (fontanero y admin) */
  @UseGuards(JwtAuthGuard, new RolesGuard([1,3]))
  @Post('admin/post-all-cities')
    async submitAllClients(@Req() request: AuthRequest,@Body() citiesArray: CitiesArrayDto) {    
      return await this.citiesServices.submitAllCities(request, citiesArray.cities);
  }

  /** ✅ Obtener todos los tipos de clientes no sincronizados desde el la base de datos (fontanero y admin) */
  @UseGuards(JwtAuthGuard, new RolesGuard([1,3]))
  @Get('admin/get-all-cities')
    async getAllTypeClient(@Req() request: AuthRequest ) {    
      return await this.citiesServices.getAllCities(request);
  }
  
    /** ✅ Tipos de clientes sincronizados en móbil (fontanero y admin) */
  @UseGuards(JwtAuthGuard, new RolesGuard([1,3]))
  @Patch('admin/patch-sync-cities')
    async syncClients(@Req() request: AuthRequest,@Body() citiesArray: CitiesArrayDto ) {    
      return await this.citiesServices.syncCities(request,citiesArray.cities);
  }

}
