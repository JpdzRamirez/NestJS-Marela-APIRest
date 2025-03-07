import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { TypeClientRepository } from './type_client.repository';
import { PostAllTypeClientDto } from './dto/post-AllTypeClient.dto';
import { TypeClient } from './type_client.entity';
import { AuthRequest } from '../../types';

import { UtilityService } from '../../shared/utility/utility.service';

@Injectable()
export class TypeClientServices {
  constructor(
    private readonly clientRepository: TypeClientRepository,
    private readonly utilityService: UtilityService    
  ) {}
/** ✅ Obtener todas las facturas*/
  async submitAllTypeClient(AuthRequest: AuthRequest, clientsArray: PostAllTypeClientDto[]): Promise<TypeClient[]| Boolean> {
    const user = AuthRequest.user;
    if (!user || !user.schemas || !user.schemas.name || !user.uuid_authsupa  ) {
      throw new HttpException('Usuario sin acueducto', HttpStatus.NOT_FOUND);
    }
    const uuidAuthsupa: string = user.uuid_authsupa;
    // Mapear todos los DTOs a entidades
    const newTypeClient = clientsArray.map(dto => 
        this.utilityService.mapDtoToTypeClientEntity(dto, uuidAuthsupa)
    );

    // Enviar los clientes al repositorio para inserción en la BD
    return await this.clientRepository.submitAllTypeClient(user.schemas.name, newTypeClient);

  }

}
