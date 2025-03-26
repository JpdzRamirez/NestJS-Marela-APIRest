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
    SetMetadata,
    HttpStatus,
    HttpCode,
    UsePipes,
    ValidationPipe
  } from '@nestjs/common';
import { TypeClientServices } from './type_client.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/role-check.guard';
import { TypeClientArrayDto  } from './dto/typeClient.dto';
import { AuthRequest } from '../../types';
import { LoggerServices } from '../logger/logger.service';

@Controller('type-client')
export class TypeClientController {

constructor(
  private readonly typeClientServices: TypeClientServices,
  private readonly logger: LoggerServices,
) {}

  /** ✅ Subir todos los tipos de clientes no sincronizados desde el móbil (Solo admin) */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetMetadata('roles', [1,3]) 
  @HttpCode(201)
  @UsePipes(new ValidationPipe({ whitelist: true })) 
  @Post('admin/post-all-typeClient')
  async submitAllTypeClient(@Req() request: AuthRequest,@Body() typeClientArray: TypeClientArrayDto ) {    
  try {  
  return await this.typeClientServices.submitAllTypeClient(request, typeClientArray.type_clients);
  } catch (error) {
    const status = error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const response = error instanceof HttpException ? error.getResponse() : { message: 'Error interno', status: false };
    const errorMessage = typeof response === 'object' && 'message' in response ? response.message : 'Error desconocido';

    this.logger.error(
      `Error en TypeClientController.submitAllTypeClient - Status: ${status} - Mensaje: ${errorMessage}`,
      error.stack,
      request,
      status,
    );
    throw new HttpException(response, status);
  }
  }

  /** ✅ Obtener todos los tipos de clientes no sincronizados desde el la base de datos (Solo admin) */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetMetadata('roles', [1,3]) 
  @HttpCode(200)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Get('admin/get-all-typeClient')
  async getAllTypeClient(@Req() request: AuthRequest ) { 
    try {     
      return await this.typeClientServices.getAllTypeClient(request);
    } catch (error) {
      const status = error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
      const response = error instanceof HttpException ? error.getResponse() : { message: 'Error interno', status: false };
      const errorMessage = typeof response === 'object' && 'message' in response ? response.message : 'Error desconocido';

      this.logger.error(
        `Error en StatesController.getAllTypeClient - Status: ${status} - Mensaje: ${errorMessage}`,
        error.stack,
        request,
        status,
      );

      throw new HttpException(response, status);
    }
  }

  /** ✅ Tipos de clientes sincronizados en móbil (Solo admin) */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetMetadata('roles', [1,3]) 
  @Patch('admin/patch-sync-typeClient')
    async syncTypeClient(@Req() request: AuthRequest,@Body() typeClientArray: TypeClientArrayDto ) {    
  try {   
    return await this.typeClientServices.syncTypeClient(request,typeClientArray.type_clients);
  } catch (error) {
    const status = error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const response = error instanceof HttpException ? error.getResponse() : { message: 'Error interno', status: false };
    const errorMessage = typeof response === 'object' && 'message' in response ? response.message : 'Error desconocido';

    this.logger.error(
      `Error en StatesController.syncTypeClient - Status: ${status} - Mensaje: ${errorMessage}`,
      error.stack,
      request,
      status,
    );

    throw new HttpException(response, status);
  }
  }

}
