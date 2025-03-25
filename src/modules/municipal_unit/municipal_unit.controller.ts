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
    HttpCode,
    UsePipes,
    ValidationPipe
  } from '@nestjs/common';
import { MunicipalUnitService } from './municipal_unit.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/role-check.guard';
import { MunicipalUnitArrayDto } from './dto/municipal_unit.dto';
import { AuthRequest } from '../../types';
import { LoggerServices } from '../logger/logger.service';

@Controller('municipal-unit')
export class MunicipalUnitController {

constructor(
  private readonly municipalUnitServices: MunicipalUnitService,
  private readonly logger: LoggerServices,
) {}

  /** ✅ Subir todos las unidades municipales no sincronizados desde el móbil (fontanero y admin) */
  @UseGuards(JwtAuthGuard, new RolesGuard([1,3]))
  @HttpCode(201)
  @UsePipes(new ValidationPipe({ whitelist: true })) 
  @Post('admin/post-all-municipalUnit')
    async submitAllMunicipalUnits(@Req() request: AuthRequest,@Body() municipal_unitArray: MunicipalUnitArrayDto) {    
    try {  
      return await this.municipalUnitServices.submitAllMunicipalUnits(request, municipal_unitArray.municipal_units);
    } catch (error) {
      const status = error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
      const response = error instanceof HttpException ? error.getResponse() : { message: 'Error interno', status: false };
      const errorMessage = typeof response === 'object' && 'message' in response ? response.message : 'Error desconocido';

      this.logger.error(
        `Error en MunicipalUnitController.submitAllMunicipalUnits - Status: ${status} - Mensaje: ${errorMessage}`,
        error.stack,
        request,
        status,
      );
      throw new HttpException(response, status);
    }
  }

  /** ✅ Obtener todos las unidades municipales no sincronizados desde el la base de datos (fontanero y admin) */
  @UseGuards(JwtAuthGuard, new RolesGuard([1,3]))
  @HttpCode(200)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Get('admin/get-all-municipalUnit')
    async getAllMunicipalUnits(@Req() request: AuthRequest ) {   
    try {  
      return await this.municipalUnitServices.getAllMunicipalUnits(request);
    } catch (error) {
      const status = error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
      const response = error instanceof HttpException ? error.getResponse() : { message: 'Error interno', status: false };
      const errorMessage = typeof response === 'object' && 'message' in response ? response.message : 'Error desconocido';

      this.logger.error(
        `Error en MunicipalUnitController.getAllMunicipalUnits - Status: ${status} - Mensaje: ${errorMessage}`,
        error.stack,
        request,
        status,
      );

      throw new HttpException(response, status);
    }
  }
  
  /** ✅ Unidades municipales sincronizados en móbil (fontanero y admin) */
  @UseGuards(JwtAuthGuard, new RolesGuard([1,3]))
  @HttpCode(201)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Patch('admin/patch-sync-municipalUnit')
    async syncMunicipalUnits(@Req() request: AuthRequest,@Body() municipal_unitArray: MunicipalUnitArrayDto ) {    
    try {
      return await this.municipalUnitServices.syncMunicipalUnits(request,municipal_unitArray.municipal_units);
    } catch (error) {
      const status = error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
      const response = error instanceof HttpException ? error.getResponse() : { message: 'Error interno', status: false };
      const errorMessage = typeof response === 'object' && 'message' in response ? response.message : 'Error desconocido';

      this.logger.error(
        `Error en MunicipalUnitController.syncMunicipalUnits - Status: ${status} - Mensaje: ${errorMessage}`,
        error.stack,
        request,
        status,
      );

      throw new HttpException(response, status);
    }
  }
}
