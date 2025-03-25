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


/** ✅ Obtener todas los tipos de documentos*/
  async submitAllTypeDocument(AuthRequest: AuthRequest, typeDocumentArray: TypeDocumentDto[]): Promise<{ 
    message: String;
    inserted: { 
      id: number;
      id_tipodocumento: string;
      nombre: string
    }[]; 
    duplicated: TypeDocumentDto[];
    existing: TypeDocumentDto[]; 
}> {
    const user = AuthRequest.user;
    if (!user || !user.schemas || !user.schemas.name || !user.uuid_authsupa  ) {
      throw new HttpException('Usuario sin acueducto', HttpStatus.NOT_FOUND);
    }
    const uuidAuthsupa: string = user.uuid_authsupa;
    // Mapear todos los DTOs a entidades
    const newTypeDocument = this.utilityService.mapDtoToTypeDocumentAndRemoveDuplicateEntity(typeDocumentArray, uuidAuthsupa);
    // Enviar los clientes al repositorio para inserción en la BD
    const result= await this.clientRepository.submitAllTypeDocument(user.schemas.name, newTypeDocument);

    if (!result.status) {
      throw new HttpException(
        {
          message: result.message,
          status: result.status,
          inserted: result.inserted,
          duplicated: result.duplicated,
          existing: result.existing
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
    
    return result; 
  }


  async getAllTypeDocument(AuthRequest: AuthRequest): Promise<{ 
    message: String,
    status:boolean,
    type_documents:TypeDocument[]
  }> {
    const user = AuthRequest.user;
    if (!user || !user.schemas || !user.schemas.name || !user.uuid_authsupa  ) {
      throw new HttpException('Usuario sin acueducto', HttpStatus.NOT_FOUND);
    }

    // Enviar los tipos de clientes al repositorio para inserción en la BD
    const result= await this.clientRepository.getAllTypeDocument(user.schemas.name,user.uuid_authsupa);

    if (!result.status) {
      throw new HttpException(
        {
          message: result.message,
          status: result.status,
          type_documents: result.type_documents
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
    
    return result; 
  }



  /** ✅ Sincronizar los tipos de clientes*/
  async syncTypeDocument(AuthRequest: AuthRequest, typeDocumentArray: TypeDocumentDto[]): Promise<{ 
    message: String,
    status: Boolean,
    syncronized: TypeDocumentDto[],
    duplicated: TypeDocumentDto[] | null   
}> {
    const user = AuthRequest.user;
    if (!user || !user.schemas || !user.schemas.name || !user.uuid_authsupa  ) {
      throw new HttpException('Usuario sin acueducto', HttpStatus.NOT_FOUND);
    }
    const uuidAuthsupa: string = user.uuid_authsupa;

    const typeDocumentArrayFiltred = this.utilityService.removeDuplicateTypeDocument(typeDocumentArray);

    // Enviar los clientes al repositorio para inserción en la BD
    const result= await  this.clientRepository.syncTypeDocument(user.schemas.name, uuidAuthsupa,typeDocumentArrayFiltred);

    if (!result.status) {
      throw new HttpException(
        {
          message: result.message,
          status: result.status,
          syncronized: result.syncronized,
          duplicated: result.duplicated
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
    
    return result; 

  }
}


