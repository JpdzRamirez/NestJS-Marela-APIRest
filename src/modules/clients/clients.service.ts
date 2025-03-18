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
      inserted: { id: number; id_cliente: string; nombre: string }[];
      duplicated: ClientsDto[];      
  }> {
    const user = AuthRequest.user;
    if (!user || !user.schemas || !user.schemas.name || !user.uuid_authsupa ) {
      throw new HttpException('Usuario sin acueducto', HttpStatus.NOT_FOUND);
    }
    const uuidAuthsupa: string = user.uuid_authsupa;
    // Mapear todos los DTOs a entidades    
    const newClients = this.utilityService.mapDtoClientToEntityAndRemoveDuplicate(clientsArray, uuidAuthsupa)
    // Enviar los clientes al repositorio para inserción en la BD
    return await this.clientRepository.submitAllClients(user.schemas.name, newClients);

  }

    async getAllClients(AuthRequest: AuthRequest): Promise<{ 
      message: String,
      clients:Client[]
      }> {
      const user = AuthRequest.user;
      if (!user || !user.schemas || !user.schemas.name || !user.uuid_authsupa  ) {
        throw new HttpException('Usuario sin acueducto', HttpStatus.NOT_FOUND);
      }
      // Enviar los clientes al repositorio para inserción en la BD
      return await this.clientRepository.getAllClients(user.schemas.name,user.uuid_authsupa);
    }
  
  
  
    /** ✅ Sincronizar los tipos de clientes*/
    async syncClients(AuthRequest: AuthRequest, clientsArray: ClientsDto[]): Promise<{ 
      message: String,
      status: Boolean,
      duplicated: ClientsDto[] | null    
  }> {
      const user = AuthRequest.user;
      if (!user || !user.schemas || !user.schemas.name || !user.uuid_authsupa  ) {
        throw new HttpException('Usuario sin acueducto', HttpStatus.NOT_FOUND);
      }
      const uuidAuthsupa: string = user.uuid_authsupa;
  
      const clientArrayFiltred = this.utilityService.removeDuplicateClients(clientsArray);
  
      // Enviar los clientes al repositorio para inserción en la BD
      return await this.clientRepository.syncClient(user.schemas.name, uuidAuthsupa,clientArrayFiltred);
  
    }

}
