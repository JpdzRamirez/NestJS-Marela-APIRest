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
/** ✅ Obtener todas las departamentos*/
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
      existing: StateDto[];      
  }> {
    const user = AuthRequest.user;
    if (!user || !user.schemas || !user.schemas.name || !user.uuid_authsupa ) {
      throw new HttpException('Usuario sin acueducto', HttpStatus.NOT_FOUND);
    }
    const uuidAuthsupa: string = user.uuid_authsupa;
    // Mapear todos los DTOs a entidades    
    const newStates = this.utilityService.mapDtoStateToEntityAndRemoveDuplicate(statesArray, uuidAuthsupa)
    // Enviar los departamentos al repositorio para inserción en la BD
    return await this.stateRepository.submitAllStates(user.schemas.name, newStates);

  }
    /** ✅ Enviar los departamentos pendientes por sincronizar*/
  async getAllStates(AuthRequest: AuthRequest): Promise<{ 
      message: String,
      status:boolean,
      states:State[]
      }> {
      const user = AuthRequest.user;
      if (!user || !user.schemas || !user.schemas.name || !user.uuid_authsupa  ) {
        throw new HttpException('Usuario sin autorizacion', HttpStatus.NOT_FOUND);
      }
      // Enviar los departamentos al repositorio para inserción en la BD
      return await this.stateRepository.getAllStates(user.schemas.name,user.uuid_authsupa);

    }
  
    /** ✅ Sincronizar los departamentos*/
    async syncStates(AuthRequest: AuthRequest, statesArray: StateDto[]): Promise<{ 
      message: String,
      status: Boolean,
      syncronized: StateDto[],
      duplicated: StateDto[] | null    
  }> {
      const user = AuthRequest.user;
      if (!user || !user.schemas || !user.schemas.name || !user.uuid_authsupa  ) {
        throw new HttpException('Usuario sin acueducto', HttpStatus.NOT_FOUND);
      }
      const uuidAuthsupa: string = user.uuid_authsupa;
  
      const statesArrayFiltred = this.utilityService.removeDuplicateStates(statesArray);
  
      // Enviar los departamentos al repositorio para inserción en la BD      
      return await this.stateRepository.syncStates(user.schemas.name, uuidAuthsupa,statesArrayFiltred);
      
    }

}
