import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { StateRepository } from './states.repository';
import { StateDto } from './dto/state.dto';

import { State } from './state.entity';
import { AuthRequest } from '../../types';

import { UtilityService } from '../../shared/utility/utility.service';

@Injectable()
export class StatesService {

  constructor(
    private readonly stateRepository: StateRepository,
    private readonly utilityService: UtilityService    
  ) {}
/** ✅ Obtener todas las facturas*/
  async submitAllStates(AuthRequest: AuthRequest, statesArray: StateDto[]): Promise<{ 
      message: string,
      status: boolean,
      inserted: { 
        id: number;
        id_departamento: string;
        nombre: string;
        codigo: number;
       }[];
      duplicated: StateDto[];      
  }> {
    const user = AuthRequest.user;
    if (!user || !user.schemas || !user.schemas.name || !user.uuid_authsupa ) {
      throw new HttpException('Usuario sin acueducto', HttpStatus.NOT_FOUND);
    }
    const uuidAuthsupa: string = user.uuid_authsupa;
    // Mapear todos los DTOs a entidades    
    const newMunicipalUnits = this.utilityService.mapDtoStateToEntityAndRemoveDuplicate(statesArray, uuidAuthsupa)
    // Enviar los clientes al repositorio para inserción en la BD
    return await this.stateRepository.submitAllStates(user.schemas.name, newMunicipalUnits);

  }

    async getAllStates(AuthRequest: AuthRequest): Promise<{ 
      message: String,
      states:State[]
      }> {
      const user = AuthRequest.user;
      if (!user || !user.schemas || !user.schemas.name || !user.uuid_authsupa  ) {
        throw new HttpException('Usuario sin acueducto', HttpStatus.NOT_FOUND);
      }
      // Enviar los clientes al repositorio para inserción en la BD
      return await this.stateRepository.getAllStates(user.schemas.name,user.uuid_authsupa);
    }
  
    /** ✅ Sincronizar los tipos de clientes*/
    async syncStates(AuthRequest: AuthRequest, statesArray: StateDto[]): Promise<{ 
      message: String,
      status: Boolean,
      duplicated: StateDto[] | null    
  }> {
      const user = AuthRequest.user;
      if (!user || !user.schemas || !user.schemas.name || !user.uuid_authsupa  ) {
        throw new HttpException('Usuario sin acueducto', HttpStatus.NOT_FOUND);
      }
      const uuidAuthsupa: string = user.uuid_authsupa;
  
      const statesArrayFiltred = this.utilityService.removeDuplicateStates(statesArray);
  
      // Enviar los clientes al repositorio para inserción en la BD
      return await this.stateRepository.syncStates(user.schemas.name, uuidAuthsupa,statesArrayFiltred);
  
    }

}
