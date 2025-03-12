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
import { ClientServices } from './clients.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/role-check.guard';

import { ClientArrayDto } from './dto/Clients.dto';

import { AuthRequest } from '../../types';

@Controller('clients')
export class ClientController {

constructor(private readonly clientServices: ClientServices) {}

  /** ✅ Subir todos los clientes no sincronizados desde el móbil (fontanero y admin) */
  @UseGuards(JwtAuthGuard, new RolesGuard([1,3]))
  @Post('admin/post-all-clients')
    async submitAllClients(@Req() request: AuthRequest,@Body() clientsArray: ClientArrayDto) {    
      return await this.clientServices.submitAllClients(request, clientsArray.clients);
  }

  /** ✅ Obtener todos los tipos de clientes no sincronizados desde el la base de datos (fontanero y admin) */
  @UseGuards(JwtAuthGuard, new RolesGuard([1,3]))
  @Get('admin/get-all-clients')
    async getAllTypeClient(@Req() request: AuthRequest ) {    
      return await this.clientServices.getAllClients(request);
  }
  
    /** ✅ Tipos de clientes sincronizados en móbil (fontanero y admin) */
  @UseGuards(JwtAuthGuard, new RolesGuard([1,3]))
  @Patch('admin/patch-sync-clients')
    async syncClients(@Req() request: AuthRequest,@Body() clientsArray: ClientArrayDto ) {    
      return await this.clientServices.syncClients(request,clientsArray.clients);
  }
}
