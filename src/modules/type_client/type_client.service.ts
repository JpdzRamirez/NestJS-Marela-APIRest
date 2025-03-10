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
    message: String;
    inserted: { id: number; nombre: string }[]; 
    duplicated: { id: number; nombre: string }[] 
}> {
    const user = AuthRequest.user;
    if (!user || !user.schemas || !user.schemas.name || !user.uuid_authsupa  ) {
      throw new HttpException('Usuario sin acueducto', HttpStatus.NOT_FOUND);
    }
    const uuidAuthsupa: string = user.uuid_authsupa;
    // Mapear todos los DTOs a entidades
    const newTypeClient = typeClientsArray.map(dto => 
        this.utilityService.mapDtoToTypeClientEntity(dto, uuidAuthsupa)
    );
    // Enviar los clientes al repositorio para inserción en la BD
    return await this.clientRepository.submitAllTypeClient(user.schemas.name, newTypeClient);

  }


  async getAllTypeClient(AuthRequest: AuthRequest): Promise<{ 
    message: String,
    type_client:TypeClient[]
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
    duplicated: TypeClientDto[] | null   
}> {
    const user = AuthRequest.user;
    if (!user || !user.schemas || !user.schemas.name || !user.uuid_authsupa  ) {
      throw new HttpException('Usuario sin acueducto', HttpStatus.NOT_FOUND);
    }
    const uuidAuthsupa: string = user.uuid_authsupa;

    const typeClientArrayFiltred = this.utilityService.removeDuplicatTypeClients(typeClientsArray);

    // Enviar los clientes al repositorio para inserción en la BD
    return await this.clientRepository.syncTypeClient(user.schemas.name, uuidAuthsupa,typeClientArrayFiltred);

  }
}


