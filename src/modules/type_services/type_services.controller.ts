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
import { TypeServicesService } from './type_services.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/role-check.guard';

import { TypeServiceArrayDto } from './dto/type_services.dto';

import { AuthRequest } from '../../types';

@Controller('type-services')
export class TypeServicesController {

constructor(private readonly typeServicesServices: TypeServicesService) {}

  /** ✅ Subir todos las tipos de servicios no sincronizados desde el móbil (fontanero y admin) */
  @UseGuards(JwtAuthGuard, new RolesGuard([1,3]))
  @Post('admin/post-all-cities')
    async submitAllTypeServices(@Req() request: AuthRequest,@Body() typeServicesArray: TypeServiceArrayDto) {    
      return await this.typeServicesServices.submitAllTypeServices(request, typeServicesArray.types_services);
  }

  /** ✅ Obtener todos las tipos de servicios no sincronizados desde el la base de datos (fontanero y admin) */
  @UseGuards(JwtAuthGuard, new RolesGuard([1,3]))
  @Get('admin/get-all-cities')
    async getAllTypeServices(@Req() request: AuthRequest ) {    
      return await this.typeServicesServices.getAllTypeServices(request);
  }
  
    /** ✅ Tipos de servicios sincronizados en móbil (fontanero y admin) */
  @UseGuards(JwtAuthGuard, new RolesGuard([1,3]))
  @Patch('admin/patch-sync-cities')
    async syncTypeServices(@Req() request: AuthRequest,@Body() typeServicesArray: TypeServiceArrayDto ) {    
      return await this.typeServicesServices.syncTypeServices(request,typeServicesArray.types_services);
  }

}
