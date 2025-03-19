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
import { StatesService } from './states.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/role-check.guard';

import { StatesArrayDto } from './dto/state.dto';

import { AuthRequest } from '../../types';

@Controller('states')
export class StatesController {

constructor(private readonly stateServices: StatesService) {}

  /** ✅ Subir todos los departamentos no sincronizados desde el móbil (fontanero y admin) */
  @UseGuards(JwtAuthGuard, new RolesGuard([1,3]))
  @Post('admin/post-all-states')
    async submitAllClients(@Req() request: AuthRequest,@Body() statesArray: StatesArrayDto) {    
      return await this.stateServices.submitAllStates(request, statesArray.states);
  }

  /** ✅ Obtener todos los departamentos no sincronizados desde el la base de datos (fontanero y admin) */
  @UseGuards(JwtAuthGuard, new RolesGuard([1,3]))
  @Get('admin/get-all-states')
    async getAllTypeClient(@Req() request: AuthRequest ) {    
      return await this.stateServices.getAllStates(request);
  }
  
    /** ✅ Departamentos sincronizados en móbil (fontanero y admin) */
  @UseGuards(JwtAuthGuard, new RolesGuard([1,3]))
  @Patch('admin/patch-sync-states')
    async syncClients(@Req() request: AuthRequest,@Body() citiesArray: StatesArrayDto ) {    
      return await this.stateServices.syncStates(request,citiesArray.states);
  }

}
