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

import { PostAllClientsDto } from './dto/post-AllClients.dto';

import { AuthRequest } from '../../types';

@Controller('client')
export class ClientController {

constructor(private readonly clientServices: ClientServices) {}

  /** ✅ Obtener todas las facturas (Solo admin) */
  @UseGuards(JwtAuthGuard, new RolesGuard([1]))
  @Post('admin/get-all-invoices')
  async getAllInvoices(@Req() request: AuthRequest,@Body() dateParameters: PostAllClientsDto) {
    return await this.clientServices.submitAllClients(request,dateParameters);
  }
}
