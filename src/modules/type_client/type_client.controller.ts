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

import { PostAllTypeClientDto } from './dto/post-AllTypeClient.dto';

import { AuthRequest } from '../../types';

@Controller('type-client')
export class TypeClientController {

constructor(private readonly typeClientServices: TypeClientServices) {}

  /** ✅ Obtener todas las facturas (Solo admin) */
  @UseGuards(JwtAuthGuard, new RolesGuard([1]))
  @Post('admin/post-all-typeClient')
  async submitAllTypeClient(@Req() request: AuthRequest,@Body() typeClientArray: PostAllTypeClientDto | PostAllTypeClientDto[]) {
  // Asegurar que siempre sea un array
  const clients = Array.isArray(typeClientArray) ? typeClientArray : [typeClientArray];
  
  return await this.typeClientServices.submitAllTypeClient(request, clients);
  }

}
