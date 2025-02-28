import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ClientRepository } from './client.repository';
import { PostAllClientsDto } from './dto/post-AllClients.dto';
import { Client } from './client.entity';
import { AuthRequest } from '../../types';

@Injectable()
export class ClientServices {
  constructor(
    private readonly clientRepository: ClientRepository    
  ) {}
/** ✅ Obtener todas las facturas*/
  async submitAllClients(AuthRequest: AuthRequest, clientsArray:PostAllClientsDto): Promise<Client[]| Boolean> {
    const user = AuthRequest.user;
    if (!user || !user.schemas || !user.schemas.name ) {
      throw new HttpException('Usuario sin acueducto', HttpStatus.NOT_FOUND);
    }

    return await this.clientRepository.submitAllClients(user.schemas.name, clientsArray);

  }

}
