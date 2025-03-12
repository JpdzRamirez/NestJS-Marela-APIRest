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
import { TypeDocumentServices } from './type_document.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/role-check.guard';

import { TypeDocumentArrayDto  } from './dto/typeDocument.dto';

import { AuthRequest } from '../../types';

@Controller('type-document')
export class TypeDocumentController {

constructor(private readonly typeDocumentServices: TypeDocumentServices) {}

  /** ✅ Subir todos los tipos de documentos no sincronizados desde el móbil (admin y fontanero) */
  @UseGuards(JwtAuthGuard, new RolesGuard([1,3]))
  @Post('admin/post-all-typeDocument')
  async submitAllTypeDocument(@Req() request: AuthRequest,@Body() typeDocumentArray: TypeDocumentArrayDto ) {      
  return await this.typeDocumentServices.submitAllTypeDocument(request, typeDocumentArray.type_documents);
  }

  /** ✅ Obtener todos los tipos de documentos no sincronizados desde el la base de datos (admin y fontanero) */
  @UseGuards(JwtAuthGuard, new RolesGuard([1,3]))
  @Get('admin/get-all-typeDocument')
  async getAllTypeDocument(@Req() request: AuthRequest ) {        
    return await this.typeDocumentServices.getAllTypeDocument(request);
  }

  /** ✅ Tipos de Documentos sincronizados en móbil (admin y fontanero) */
  @UseGuards(JwtAuthGuard, new RolesGuard([1,3]))
  @Patch('admin/patch-sync-typeDocument')
    async syncTypeDocument(@Req() request: AuthRequest,@Body() typeDocumentArray: TypeDocumentArrayDto ) {    
    return await this.typeDocumentServices.syncTypeDocument(request,typeDocumentArray.type_documents);
  }

}
