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

@Controller('client')
export class ClientController {

constructor(private readonly clientServices: ClientServices) {}

  /** ✅ Obtener todas las facturas (Solo admin) */
  @UseGuards(JwtAuthGuard, new RolesGuard([1,3]))
  @Post('admin/post-all-clients')
  async submitAllClients(@Req() request: AuthRequest,@Body() clientsArray: ClientArrayDto) {    
  return await this.clientServices.submitAllClients(request, clientsArray.clients);
  }
}
