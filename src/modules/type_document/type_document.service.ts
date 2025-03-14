import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { TypeDocumentRepository } from './type_document.repository';
import { TypeDocumentDto } from './dto/typeDocument.dto';
import { TypeDocument } from './type_document.entity';
import { AuthRequest } from '../../types';

import { UtilityService } from '../../shared/utility/utility.service';

@Injectable()
export class TypeDocumentServices {
  constructor(
    private readonly clientRepository: TypeDocumentRepository,
    private readonly utilityService: UtilityService    
  ) {}


/** ✅ Obtener todas los tipos de clientes*/
  async submitAllTypeDocument(AuthRequest: AuthRequest, typeDocumentArray: TypeDocumentDto[]): Promise<{ 
    message: String;
    inserted: { id: number; id_tipodocumento: string; nombre: string }[]; 
    duplicated: { id: number; nombre: string }[] 
}> {
    const user = AuthRequest.user;
    if (!user || !user.schemas || !user.schemas.name || !user.uuid_authsupa  ) {
      throw new HttpException('Usuario sin acueducto', HttpStatus.NOT_FOUND);
    }
    const uuidAuthsupa: string = user.uuid_authsupa;
    // Mapear todos los DTOs a entidades
    const newTypeDocument = this.utilityService.mapDtoToTypeDocumentAndRemoveDuplicateEntity(typeDocumentArray, uuidAuthsupa);
    // Enviar los clientes al repositorio para inserción en la BD
    return await this.clientRepository.submitAllTypeDocument(user.schemas.name, newTypeDocument);

  }


  async getAllTypeDocument(AuthRequest: AuthRequest): Promise<{ 
    message: String,
    type_documents:TypeDocument[]
  }> {
    const user = AuthRequest.user;
    if (!user || !user.schemas || !user.schemas.name || !user.uuid_authsupa  ) {
      throw new HttpException('Usuario sin acueducto', HttpStatus.NOT_FOUND);
    }

    // Enviar los clientes al repositorio para inserción en la BD
    return await this.clientRepository.getAllTypeDocument(user.schemas.name,user.uuid_authsupa);

  }



  /** ✅ Sincronizar los tipos de clientes*/
  async syncTypeDocument(AuthRequest: AuthRequest, typeDocumentArray: TypeDocumentDto[]): Promise<{ 
    message: String,
    status: Boolean,
    duplicated: TypeDocumentDto[] | null   
}> {
    const user = AuthRequest.user;
    if (!user || !user.schemas || !user.schemas.name || !user.uuid_authsupa  ) {
      throw new HttpException('Usuario sin acueducto', HttpStatus.NOT_FOUND);
    }
    const uuidAuthsupa: string = user.uuid_authsupa;

    const typeDocumentArrayFiltred = this.utilityService.removeDuplicateTypeDocument(typeDocumentArray);

    // Enviar los clientes al repositorio para inserción en la BD
    return await this.clientRepository.syncTypeDocument(user.schemas.name, uuidAuthsupa,typeDocumentArrayFiltred);

  }
}


