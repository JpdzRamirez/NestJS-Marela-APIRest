import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CityRepository } from './cities.repository';
import { CityDto } from './dto/cities.dto';

import { City } from './city.entity';
import { AuthRequest } from '../../types';

import { UtilityService } from '../../shared/utility/utility.service';

@Injectable()
export class CityServices {

  constructor(
    private readonly cityRepository: CityRepository,
    private readonly utilityService: UtilityService    
  ) {}
/** ✅ Obtener todas las facturas*/
  async submitAllMunicipalUnits(AuthRequest: AuthRequest, cityArray: CityDto[]): Promise<{ 
      message: string,
      status: boolean,
      inserted: { id: number; id_unidadmunicipal: string; nombre: string }[];
      duplicated: CityDto[];      
  }> {
    const user = AuthRequest.user;
    if (!user || !user.schemas || !user.schemas.name || !user.uuid_authsupa ) {
      throw new HttpException('Usuario sin acueducto', HttpStatus.NOT_FOUND);
    }
    const uuidAuthsupa: string = user.uuid_authsupa;
    // Mapear todos los DTOs a entidades    
    const newMunicipalUnits = this.utilityService.mapDtoCityToEntityAndRemoveDuplicate(cityArray, uuidAuthsupa)
    // Enviar los clientes al repositorio para inserción en la BD
    return await this.cityRepository.submitAllCities(user.schemas.name, newMunicipalUnits);

  }

    async getAllMunicipalUnits(AuthRequest: AuthRequest): Promise<{ 
      message: String,
      municipal_units:City[]
      }> {
      const user = AuthRequest.user;
      if (!user || !user.schemas || !user.schemas.name || !user.uuid_authsupa  ) {
        throw new HttpException('Usuario sin acueducto', HttpStatus.NOT_FOUND);
      }
      // Enviar los clientes al repositorio para inserción en la BD
      return await this.cityRepository.getAllCities(user.schemas.name,user.uuid_authsupa);
    }
  
    /** ✅ Sincronizar los tipos de clientes*/
    async syncMunicipalUnits(AuthRequest: AuthRequest, cityArray: CityDto[]): Promise<{ 
      message: String,
      status: Boolean,
      duplicated: CityDto[] | null    
  }> {
      const user = AuthRequest.user;
      if (!user || !user.schemas || !user.schemas.name || !user.uuid_authsupa  ) {
        throw new HttpException('Usuario sin acueducto', HttpStatus.NOT_FOUND);
      }
      const uuidAuthsupa: string = user.uuid_authsupa;
  
      const clientArrayFiltred = this.utilityService.removeDuplicateMunicipalUnits(cityArray);
  
      // Enviar los clientes al repositorio para inserción en la BD
      return await this.cityRepository.syncCities(user.schemas.name, uuidAuthsupa,clientArrayFiltred);
  
    }

}
