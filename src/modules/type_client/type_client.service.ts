import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { TypeClientRepository } from './type_client.repository';
import { TypeClientDto } from './dto/typeClient.dto';
import { TypeClient } from './type_client.entity';
import { AuthRequest } from '../../types';
import { UtilityService } from '../../shared/utility/utility.service';

@Injectable()
export class TypeClientServices {
  constructor(
    private readonly clientRepository: TypeClientRepository,
    private readonly utilityService: UtilityService    
  ) {}


/** ✅ Obtener todas los tipos de clientes*/
  async submitAllTypeClient(AuthRequest: AuthRequest, typeClientsArray: TypeClientDto[]): Promise<{ 
    message: string;
    status: boolean;
    inserted: { 
      id: number;
      id_tipocliente: string;
      nombre: string 
    }[];
    duplicated: TypeClientDto[];
    existing: TypeClientDto[];     
}> {
    const user = AuthRequest.user;
    if (!user || !user.schemas || !user.schemas.name || !user.uuid_authsupa  ) {
      throw new HttpException('Usuario sin acueducto', HttpStatus.NOT_FOUND);
    }
    const uuidAuthsupa: string = user.uuid_authsupa;
    // Mapear todos los DTOs a entidades
    const newTypeClientArray = this.utilityService.mapDtoTypeClientToEntityAndRemoveDuplicate(typeClientsArray, uuidAuthsupa)
    
    // Enviar los tipos de clientes al repositorio para inserción en la BD
    const result= await this.clientRepository.submitAllTypeClient(user.schemas.name, newTypeClientArray);

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


  async getAllTypeClient(AuthRequest: AuthRequest): Promise<{ 
    message: String,
    type_clients:TypeClient[]
  }> {
    const user = AuthRequest.user;
    if (!user || !user.schemas || !user.schemas.name || !user.uuid_authsupa  ) {
      throw new HttpException('Usuario sin acueducto', HttpStatus.NOT_FOUND);
    }

    // Enviar los clientes al repositorio para inserción en la BD
    return await this.clientRepository.getAllTypeClient(user.schemas.name,user.uuid_authsupa);

  }



  /** ✅ Sincronizar los tipos de clientes*/
  async syncTypeClient(AuthRequest: AuthRequest, typeClientsArray: TypeClientDto[]): Promise<{ 
    message: String,
    status: Boolean,
    syncronized: TypeClientDto[],
    duplicated: TypeClientDto[] | null   
}> {
    const user = AuthRequest.user;
    if (!user || !user.schemas || !user.schemas.name || !user.uuid_authsupa  ) {
      throw new HttpException('Usuario sin acueducto', HttpStatus.NOT_FOUND);
    }
    const uuidAuthsupa: string = user.uuid_authsupa;

    const typeClientArrayFiltred = this.utilityService.removeDuplicateTypeClients(typeClientsArray);

    // Enviar los tipos de clientes al repositorio para inserción en la BD
    const result= await this.clientRepository.syncTypeClient(user.schemas.name, uuidAuthsupa,typeClientArrayFiltred);

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


