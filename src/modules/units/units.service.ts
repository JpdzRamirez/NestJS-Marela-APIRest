import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { UnitsRepository } from './units.repository';
import { UnitDto } from './dto/units.dto';
import { Unit } from './units.entity';
import { AuthRequest } from '../../types';
import { UtilityService } from '../../shared/utility/utility.service';

@Injectable()
export class UnitsService {

    
  constructor(
    private readonly unitsRepository: UnitsRepository,
    private readonly utilityService: UtilityService    
  ) {}
/** ✅ Obtener todas las Unidades*/
  async submitAllUnits(AuthRequest: AuthRequest, unitsArray: UnitDto[]): Promise<{ 
      message: string,
      status: boolean,
      inserted: { 
        id: number;
        id_unidad: string;
        nombre: string;        
       }[];
      duplicated: UnitDto[]; 
      existing: UnitDto[];       
  }> {
    const user = AuthRequest.user;
    if (!user || !user.schemas || !user.schemas.name || !user.uuid_authsupa ) {
      throw new HttpException('Usuario sin acueducto', HttpStatus.NOT_FOUND);
    }
    const uuidAuthsupa: string = user.uuid_authsupa;
    // Mapear todos los DTOs a entidades    
    const newCities = this.utilityService.mapDtoUnitsAndRemoveDuplicate(unitsArray, uuidAuthsupa)
    // Enviar las unidades al repositorio para inserción en la BD
    const result= await this.unitsRepository.submitAllUnits(user.schemas.name, newCities);

    if (!result.status) {
      throw new HttpException(
        {
          message: result.message,
          status: result.status,
          inserted: result.inserted,
          duplicated: result.duplicated,
          existing: result.existing
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
    
    return result; 
  
  }

    async getAllUnits(AuthRequest: AuthRequest): Promise<{ 
      message: String,
      status:boolean,
      units:Unit[]
      }> {
      const user = AuthRequest.user;
      if (!user || !user.schemas || !user.schemas.name || !user.uuid_authsupa  ) {
        throw new HttpException('Usuario sin acueducto', HttpStatus.NOT_FOUND);
      }
      // Enviar los ciudades al repositorio para inserción en la BD
      const result= await this.unitsRepository.getAllUnits(user.schemas.name,user.uuid_authsupa);

      if (!result.status) {
        throw new HttpException(
          {
            message: result.message,
            status: result.status,
            units: result.units
          },
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
      
      return result; 
    }
  
    /** ✅ Sincronizar las ciudades*/
    async syncUnits(AuthRequest: AuthRequest, unitsArray: UnitDto[]): Promise<{ 
      message: String,
      status: Boolean,
      syncronized: UnitDto[],
      duplicated: UnitDto[] | null    
  }> {
      const user = AuthRequest.user;
      if (!user || !user.schemas || !user.schemas.name || !user.uuid_authsupa  ) {
        throw new HttpException('Usuario sin acueducto', HttpStatus.NOT_FOUND);
      }
      const uuidAuthsupa: string = user.uuid_authsupa;
  
      const unitsArrayFiltred = this.utilityService.removeDuplicateUnits(unitsArray);
  
      // Enviar las ciudades al repositorio para inserción en la BD
      const result= await this.unitsRepository.syncUnits(user.schemas.name, uuidAuthsupa,unitsArrayFiltred);

      if (!result.status) {
        throw new HttpException(
          {
            message: result.message,
            status: result.status,
            syncronized: result.syncronized,
            duplicated: result.duplicated
          },
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
      
      return result; 
  
    }

}
