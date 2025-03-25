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
import { TypeServicesService } from './type_services.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/role-check.guard';
import { TypeServiceArrayDto } from './dto/type_services.dto';
import { AuthRequest } from '../../types';
import { LoggerServices } from '../logger/logger.service';

@Controller('type-services')
export class TypeServicesController {

constructor(
  private readonly typeServicesServices: TypeServicesService,
  private readonly logger: LoggerServices,
) {}

  /** ✅ Subir todos las tipos de servicios no sincronizados desde el móbil (fontanero y admin) */
  @UseGuards(JwtAuthGuard, new RolesGuard([1,3]))
  @HttpCode(201)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Post('admin/post-all-services')
    async submitAllTypeServices(@Req() request: AuthRequest,@Body() typeServicesArray: TypeServiceArrayDto) {    
    try { 
      return await this.typeServicesServices.submitAllTypeServices(request, typeServicesArray.types_services);
    } catch (error) {
      const status = error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
      const response = error instanceof HttpException ? error.getResponse() : { message: 'Error interno', status: false };
      const errorMessage = typeof response === 'object' && 'message' in response ? response.message : 'Error desconocido';

      this.logger.error(
        `Error en TypeServicesController.submitAllTypeServices - Status: ${status} - Mensaje: ${errorMessage}`,
        error.stack,
        request,
        status,
      );
      throw new HttpException(response, status);
    }
  }

  /** ✅ Obtener todos las tipos de servicios no sincronizados desde el la base de datos (fontanero y admin) */
  @UseGuards(JwtAuthGuard, new RolesGuard([1,3]))
  @HttpCode(200)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Get('admin/get-all-services')
    async getAllTypeServices(@Req() request: AuthRequest ) { 
    try {       
      return await this.typeServicesServices.getAllTypeServices(request);
    } catch (error) {
      const status = error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
      const response = error instanceof HttpException ? error.getResponse() : { message: 'Error interno', status: false };
      const errorMessage = typeof response === 'object' && 'message' in response ? response.message : 'Error desconocido';

      this.logger.error(
        `Error en TypeServicesController.getAllTypeServices - Status: ${status} - Mensaje: ${errorMessage}`,
        error.stack,
        request,
        status,
      );

      throw new HttpException(response, status);
    }
  }
  
    /** ✅ Tipos de servicios sincronizados en móbil (fontanero y admin) */
  @UseGuards(JwtAuthGuard, new RolesGuard([1,3]))
  @HttpCode(201)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Patch('admin/patch-sync-services')
    async syncTypeServices(@Req() request: AuthRequest,@Body() typeServicesArray: TypeServiceArrayDto ) {    
    try {   
      return await this.typeServicesServices.syncTypeServices(request,typeServicesArray.types_services);
    } catch (error) {
      const status = error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
      const response = error instanceof HttpException ? error.getResponse() : { message: 'Error interno', status: false };
      const errorMessage = typeof response === 'object' && 'message' in response ? response.message : 'Error desconocido';

      this.logger.error(
        `Error en TypeServicesController.syncTypeServices - Status: ${status} - Mensaje: ${errorMessage}`,
        error.stack,
        request,
        status,
      );

      throw new HttpException(response, status);
    }
  }

}
