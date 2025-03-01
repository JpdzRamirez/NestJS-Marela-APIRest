import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ClientRepository } from './client.repository';
import { PostAllClientsDto } from './dto/post-AllClients.dto';
import { Client } from './client.entity';
import { AuthRequest } from '../../types';

import { UtilityService } from '../../shared/utility/utility.service';

@Injectable()
export class ClientServices {
  constructor(
    private readonly clientRepository: ClientRepository,
    private readonly utilityService: UtilityService    
  ) {}
/** ✅ Obtener todas las facturas*/
  async submitAllClients(AuthRequest: AuthRequest, clientsArray: PostAllClientsDto[]): Promise<Client[]| Boolean> {
    const user = AuthRequest.user;
    if (!user || !user.schemas || !user.schemas.name ) {
      throw new HttpException('Usuario sin acueducto', HttpStatus.NOT_FOUND);
    }
    // Mapear todos los DTOs a entidades
    const newClients = clientsArray.map(dto => this.utilityService.mapDtoToClientEntity(dto));

    // Enviar los clientes al repositorio para inserción en la BD
    return await this.clientRepository.submitAllClients(user.schemas.name, newClients);

  }

}
