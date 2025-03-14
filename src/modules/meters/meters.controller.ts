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
import { WaterMeterService } from './meters.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/role-check.guard';

import { WaterMetersArrayDto  } from './dto/meters.dto';

import { AuthRequest } from '../../types';

@Controller('water-meter')
export class WaterMeterController {

    constructor(private readonly waterMeterServices: WaterMeterService) {}
    
      /** ✅ Subir todos los tipos de clientes no sincronizados desde el móbil (Solo admin) */
      @UseGuards(JwtAuthGuard, new RolesGuard([1,3]))
      @Post('admin/post-all-waterMeters')
      async submitAllTypeClient(@Req() request: AuthRequest,@Body() waterMetersArray: WaterMetersArrayDto ) {    
      
      return await this.waterMeterServices.submitWaterMeters(request, waterMetersArray.water_meters);
      }
    
      /** ✅ Obtener todos los tipos de clientes no sincronizados desde el la base de datos (Solo admin) */
      @UseGuards(JwtAuthGuard, new RolesGuard([1,3]))
      @Get('admin/get-all-waterMeters')
      async getAllTypeClient(@Req() request: AuthRequest ) {    
        return await this.waterMeterServices.getAllWaterMeters(request);
      }
    
      /** ✅ Tipos de clientes sincronizados en móbil (Solo admin) */
      @UseGuards(JwtAuthGuard, new RolesGuard([1,3]))
      @Patch('admin/patch-sync-waterMeters')
        async syncTypeClient(@Req() request: AuthRequest,@Body() waterMetersArray: WaterMetersArrayDto ) {    
        return await this.waterMeterServices.syncWaterMeters(request,waterMetersArray.water_meters);
      }
    
    }
    
