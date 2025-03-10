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
import { TypeClientServices } from './type_client.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/role-check.guard';

import { TypeClientArrayDto  } from './dto/typeClient.dto';

import { AuthRequest } from '../../types';

@Controller('type-client')
export class TypeClientController {

constructor(private readonly typeClientServices: TypeClientServices) {}

  /** ✅ Subir todos los tipos de clientes no sincronizados desde el móbil (Solo admin) */
  @UseGuards(JwtAuthGuard, new RolesGuard([1,3]))
  @Post('admin/post-all-typeClient')
  async submitAllTypeClient(@Req() request: AuthRequest,@Body() typeClientArray: TypeClientArrayDto ) {    
  
  return await this.typeClientServices.submitAllTypeClient(request, typeClientArray.type_clients);
  }

  /** ✅ Obtener todos los tipos de clientes no sincronizados desde el la base de datos (Solo admin) */
  @UseGuards(JwtAuthGuard, new RolesGuard([1,3]))
  @Get('admin/get-all-typeClient')
  async getAllTypeClient(@Req() request: AuthRequest ) {    
    
    return await this.typeClientServices.getAllTypeClient(request);
  }

  /** ✅ Tipos de clientes sincronizados en móbil (Solo admin) */
  @UseGuards(JwtAuthGuard, new RolesGuard([1,3]))
  @Patch('admin/patch-sync-typeClient')
    async syncTypeClient(@Req() request: AuthRequest,@Body() typeClientArray: TypeClientArrayDto ) {    
    return await this.typeClientServices.syncTypeClient(request,typeClientArray.type_clients);
  }

}
