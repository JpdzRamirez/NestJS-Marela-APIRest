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
import { MunicipalUnitService } from './municipal_unit.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/role-check.guard';

import { MunicipalUnitArrayDto } from './dto/municipal_unit.dto';

import { AuthRequest } from '../../types';

@Controller('municipal-unit')
export class MunicipalUnitController {

constructor(private readonly municipalUnitServices: MunicipalUnitService) {}

  /** ✅ Subir todos los clientes no sincronizados desde el móbil (fontanero y admin) */
  @UseGuards(JwtAuthGuard, new RolesGuard([1,3]))
  @Post('admin/post-all-municipalUnit')
    async submitAllClients(@Req() request: AuthRequest,@Body() municipal_unitArray: MunicipalUnitArrayDto) {    
      return await this.municipalUnitServices.submitAllMunicipalUnits(request, municipal_unitArray.municipal_units);
  }

  /** ✅ Obtener todos los tipos de clientes no sincronizados desde el la base de datos (fontanero y admin) */
  @UseGuards(JwtAuthGuard, new RolesGuard([1,3]))
  @Get('admin/get-all-municipalUnit')
    async getAllTypeClient(@Req() request: AuthRequest ) {    
      return await this.municipalUnitServices.getAllMunicipalUnits(request);
  }
  
    /** ✅ Tipos de clientes sincronizados en móbil (fontanero y admin) */
  @UseGuards(JwtAuthGuard, new RolesGuard([1,3]))
  @Patch('admin/patch-sync-municipalUnit')
    async syncClients(@Req() request: AuthRequest,@Body() municipal_unitArray: MunicipalUnitArrayDto ) {    
      return await this.municipalUnitServices.syncMunicipalUnits(request,municipal_unitArray.municipal_units);
  }
}
