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
  async submitAllCities(AuthRequest: AuthRequest, citiesArray: CityDto[]): Promise<{ 
      message: string,
      status: boolean,
      inserted: { 
        id: number;
        id_ciudad: string;
        nombre: string;
        codigo: number;
       }[];
      duplicated: CityDto[];      
  }> {
    const user = AuthRequest.user;
    if (!user || !user.schemas || !user.schemas.name || !user.uuid_authsupa ) {
      throw new HttpException('Usuario sin acueducto', HttpStatus.NOT_FOUND);
    }
    const uuidAuthsupa: string = user.uuid_authsupa;
    // Mapear todos los DTOs a entidades    
    const newCities = this.utilityService.mapDtoCityToEntityAndRemoveDuplicate(citiesArray, uuidAuthsupa)
    // Enviar los clientes al repositorio para inserción en la BD
    return await this.cityRepository.submitAllCities(user.schemas.name, newCities);

  }

    async getAllCities(AuthRequest: AuthRequest): Promise<{ 
      message: String,
      cities:City[]
      }> {
      const user = AuthRequest.user;
      if (!user || !user.schemas || !user.schemas.name || !user.uuid_authsupa  ) {
        throw new HttpException('Usuario sin acueducto', HttpStatus.NOT_FOUND);
      }
      // Enviar los clientes al repositorio para inserción en la BD
      return await this.cityRepository.getAllCities(user.schemas.name,user.uuid_authsupa);
    }
  
    /** ✅ Sincronizar los tipos de clientes*/
    async syncCities(AuthRequest: AuthRequest, statesArray: CityDto[]): Promise<{ 
      message: String,
      status: Boolean,
      duplicated: CityDto[] | null    
  }> {
      const user = AuthRequest.user;
      if (!user || !user.schemas || !user.schemas.name || !user.uuid_authsupa  ) {
        throw new HttpException('Usuario sin acueducto', HttpStatus.NOT_FOUND);
      }
      const uuidAuthsupa: string = user.uuid_authsupa;
  
      const citiesArrayFiltred = this.utilityService.removeDuplicateCities(statesArray);
  
      // Enviar los clientes al repositorio para inserción en la BD
      return await this.cityRepository.syncCities(user.schemas.name, uuidAuthsupa,citiesArrayFiltred);
  
    }

}
