import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { MunicipalUnitRepository } from './municipal_unit.repository';
import { MunicipalUnitDto } from './dto/municipal_unit.dto';
import { MunicipalUnit } from './municipal_unit.entity';
import { AuthRequest } from '../../types';
import { UtilityService } from '../../shared/utility/utility.service';

@Injectable()
export class MunicipalUnitService {
  constructor(
    private readonly municipalUnitRepository: MunicipalUnitRepository,
    private readonly utilityService: UtilityService    
  ) {}
/** ✅ Obtener todas las unidades municipales*/
  async submitAllMunicipalUnits(AuthRequest: AuthRequest, municipal_unitArray: MunicipalUnitDto[]): Promise<{ 
      message: string,
      status: boolean,
      inserted: { 
        id: number;
        id_unidadmunicipal: string;
        nombre: string 
      }[];
      duplicated: MunicipalUnitDto[]; 
      existing: MunicipalUnitDto[];     
  }> {
    const user = AuthRequest.user;
    if (!user || !user.schemas || !user.schemas.name || !user.uuid_authsupa ) {
      throw new HttpException('Usuario sin acueducto', HttpStatus.NOT_FOUND);
    }
    const uuidAuthsupa: string = user.uuid_authsupa;
    // Mapear todos los DTOs a entidades    
    const newMunicipalUnits = this.utilityService.mapDtoMunicipalUnitToEntityAndRemoveDuplicate(municipal_unitArray, uuidAuthsupa)
    // Enviar los unidades municipales al repositorio para inserción en la BD
    return await  this.municipalUnitRepository.submitAllMunicipalUnits(user.schemas.name, newMunicipalUnits);
  }

    async getAllMunicipalUnits(AuthRequest: AuthRequest): Promise<{ 
      message: String,
      status:boolean,
      municipal_units:MunicipalUnit[]
      }> {
      const user = AuthRequest.user;
      if (!user || !user.schemas || !user.schemas.name || !user.uuid_authsupa  ) {
        throw new HttpException('Usuario sin acueducto', HttpStatus.NOT_FOUND);
      }
      // Enviar las unidades municipales al repositorio para inserción en la BD
      return await this.municipalUnitRepository.getAllMunicipalUnits(user.schemas.name,user.uuid_authsupa);
    }
  
  
  
    /** ✅ Sincronizar las unidades municipales*/
    async syncMunicipalUnits(AuthRequest: AuthRequest, municipal_unitArray: MunicipalUnitDto[]): Promise<{ 
      message: String,
      status: Boolean,
      syncronized: MunicipalUnitDto[],
      duplicated: MunicipalUnitDto[] | null    
  }> {
      const user = AuthRequest.user;
      if (!user || !user.schemas || !user.schemas.name || !user.uuid_authsupa  ) {
        throw new HttpException('Usuario sin acueducto', HttpStatus.NOT_FOUND);
      }
      const uuidAuthsupa: string = user.uuid_authsupa;
  
      const municipal_unitArrayFiltred = this.utilityService.removeDuplicateMunicipalUnits(municipal_unitArray);
  
      // Enviar los unidades municipales al repositorio para inserción en la BD
      return await this.municipalUnitRepository.syncMunicipalUnits(user.schemas.name, uuidAuthsupa,municipal_unitArrayFiltred);
      
    }

}
