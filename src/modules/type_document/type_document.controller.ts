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
import { TypeDocumentServices } from './type_document.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/role-check.guard';
import { TypeDocumentArrayDto  } from './dto/typeDocument.dto';
import { AuthRequest } from '../../types';
import { LoggerServices } from '../logger/logger.service';

@Controller('type-document')
export class TypeDocumentController {

constructor(
  private readonly typeDocumentServices: TypeDocumentServices,
  private readonly logger: LoggerServices,
) {}

  /** ✅ Subir todos los tipos de documentos no sincronizados desde el móbil (admin y fontanero) */
    @UseGuards(JwtAuthGuard, RolesGuard)
    @SetMetadata('roles', [1,3]) 
  @HttpCode(201)
  @UsePipes(new ValidationPipe({ whitelist: true })) 
  @Post('admin/post-all-typeDocument')
  async submitAllTypeDocument(@Req() request: AuthRequest,@Body() typeDocumentArray: TypeDocumentArrayDto ) {      
  try {  
      return await this.typeDocumentServices.submitAllTypeDocument(request, typeDocumentArray.type_documents);
  } catch (error) {
    const status = error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const response = error instanceof HttpException ? error.getResponse() : { message: 'Error interno', status: false };
    const errorMessage = typeof response === 'object' && 'message' in response ? response.message : 'Error desconocido';

    this.logger.error(
      `Error en TypeDocumentController.submitAllTypeDocument - Status: ${status} - Mensaje: ${errorMessage}`,
      error.stack,
      request,
      status,
    );
    throw new HttpException(response, status);
  }
  }

  /** ✅ Obtener todos los tipos de documentos no sincronizados desde el la base de datos (admin y fontanero) */
   @UseGuards(JwtAuthGuard, RolesGuard)
   @SetMetadata('roles', [1,3]) 
  @HttpCode(200)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Get('admin/get-all-typeDocument')
  async getAllTypeDocument(@Req() request: AuthRequest ) {  
  try {        
    return await this.typeDocumentServices.getAllTypeDocument(request);
  } catch (error) {
    const status = error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const response = error instanceof HttpException ? error.getResponse() : { message: 'Error interno', status: false };
    const errorMessage = typeof response === 'object' && 'message' in response ? response.message : 'Error desconocido';

    this.logger.error(
      `Error en TypeDocumentController.getAllTypeDocument - Status: ${status} - Mensaje: ${errorMessage}`,
      error.stack,
      request,
      status,
    );

    throw new HttpException(response, status);
  }
  }

  /** ✅ Tipos de Documentos sincronizados en móbil (admin y fontanero) */
   @UseGuards(JwtAuthGuard, RolesGuard)
   @SetMetadata('roles', [1,3]) 
  @Patch('admin/patch-sync-typeDocument')
    async syncTypeDocument(@Req() request: AuthRequest,@Body() typeDocumentArray: TypeDocumentArrayDto ) {    
    try { 
    return await this.typeDocumentServices.syncTypeDocument(request,typeDocumentArray.type_documents);
    } catch (error) {
      const status = error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
      const response = error instanceof HttpException ? error.getResponse() : { message: 'Error interno', status: false };
      const errorMessage = typeof response === 'object' && 'message' in response ? response.message : 'Error desconocido';

      this.logger.error(
        `Error en StatesController.syncTypeDocument - Status: ${status} - Mensaje: ${errorMessage}`,
        error.stack,
        request,
        status,
      );

      throw new HttpException(response, status);
    }
  }

}
