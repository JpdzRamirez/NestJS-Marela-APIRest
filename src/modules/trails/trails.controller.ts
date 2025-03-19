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
import { TrailServices } from './trails.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/role-check.guard';

import { TrailArrayDto } from './dto/trail.dto';

import { AuthRequest } from '../../types';

@Controller('trails')
export class TrailController {

constructor(private readonly trailServices: TrailServices) {}

  /** ✅ Subir todos las ciudades no sincronizados desde el móbil (fontanero y admin) */
  @UseGuards(JwtAuthGuard, new RolesGuard([1,3]))
  @Post('admin/post-all-trails')
    async submitAllTrails(@Req() request: AuthRequest,@Body() trailsArray: TrailArrayDto) {    
      return await this.trailServices.submitAllTrails(request, trailsArray.trails);
  }

  /** ✅ Obtener todos las Rutas no sincronizados desde el la base de datos (fontanero y admin) */
  @UseGuards(JwtAuthGuard, new RolesGuard([1,3]))
  @Get('admin/get-all-trails')
    async getAllTrails(@Req() request: AuthRequest ) {    
      return await this.trailServices.getAllTrails(request);
  }
  
    /** ✅ Rutas sincronizados en móbil (fontanero y admin) */
  @UseGuards(JwtAuthGuard, new RolesGuard([1,3]))
  @Patch('admin/patch-sync-trails')
    async syncTrails(@Req() request: AuthRequest,@Body() citiesArray: TrailArrayDto ) {    
      return await this.trailServices.syncTrails(request,citiesArray.trails);
  }

}
