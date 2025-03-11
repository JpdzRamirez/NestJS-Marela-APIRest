import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ClientRepository } from './client.repository';
import { ClientsDto } from './dto/Clients.dto';

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
  async submitAllClients(AuthRequest: AuthRequest, clientsArray: ClientsDto[]): Promise<{ 
      message: string,
      status: boolean,
      inserted: { id: number; id_client: number; nombre: string }[]      
  }> {
    const user = AuthRequest.user;
    if (!user || !user.schemas || !user.schemas.name || !user.uuid_authsupa ) {
      throw new HttpException('Usuario sin acueducto', HttpStatus.NOT_FOUND);
    }
    const uuidAuthsupa: string = user.uuid_authsupa;
    // Mapear todos los DTOs a entidades    
    const newClients = this.utilityService.mapDtoClientToEntity(clientsArray, uuidAuthsupa)
    // Enviar los clientes al repositorio para inserción en la BD
    return await this.clientRepository.submitAllClients(user.schemas.name, newClients);

  }

}
