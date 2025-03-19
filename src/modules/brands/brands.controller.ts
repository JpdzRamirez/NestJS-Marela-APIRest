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
import { BrandsService } from './brands.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/role-check.guard';

import { BrandsArrayDto } from './dto/brand.dto';

import { AuthRequest } from '../../types';

@Controller('brands')
export class BrandsController {

constructor(private readonly brandsServices: BrandsService) {}

  /** ✅ Subir todos las marcas no sincronizados desde el móbil (fontanero y admin) */
  @UseGuards(JwtAuthGuard, new RolesGuard([1,3]))
  @Post('admin/post-all-cities')
    async submitAllClients(@Req() request: AuthRequest,@Body() brandsArray: BrandsArrayDto) {    
      return await this.brandsServices.submitAllBrands(request, brandsArray.cities);
  }

  /** ✅ Obtener todos las marcas no sincronizados desde el la base de datos (fontanero y admin) */
  @UseGuards(JwtAuthGuard, new RolesGuard([1,3]))
  @Get('admin/get-all-cities')
    async getAllTypeClient(@Req() request: AuthRequest ) {    
      return await this.brandsServices.getAllBrands(request);
  }
  
    /** ✅ Marcas sincronizados en móbil (fontanero y admin) */
  @UseGuards(JwtAuthGuard, new RolesGuard([1,3]))
  @Patch('admin/patch-sync-cities')
    async syncClients(@Req() request: AuthRequest,@Body() brandsArray: BrandsArrayDto ) {    
      return await this.brandsServices.syncBrands(request,brandsArray.cities);
  }

}
