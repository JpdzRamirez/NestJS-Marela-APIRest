import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { WaterMeterRepository } from './meters.repository';
import { WaterMetersDto } from './dto/meters.dto';
import { WaterMeter } from './meters.entity';
import { AuthRequest } from '../../types';

import { UtilityService } from '../../shared/utility/utility.service';

@Injectable()
export class WaterMeterService {
      constructor(
        private readonly waterMeterRepository: WaterMeterRepository,
        private readonly utilityService: UtilityService    
      ) {}
    

/** ✅ Subir todos los medidores no sincronizados*/
  async submitAllWaterMeter(AuthRequest: AuthRequest, waterMetersArray: WaterMetersDto[]): Promise<{ 
    message: string;
    status: boolean;
    inserted: { 
      id: number;
      id_medidor: string;
      numero_referencia: string 
    }[];
    duplicated: WaterMetersDto[];
    existing: WaterMetersDto[]; 
}> {
    const user = AuthRequest.user;
    if (!user || !user.schemas || !user.schemas.name || !user.uuid_authsupa  ) {
      throw new HttpException('Usuario sin acueducto', HttpStatus.NOT_FOUND);
    }
    const uuidAuthsupa: string = user.uuid_authsupa;
    // Mapear todos los DTOs a entidades
    const newWaterMetersArray = this.utilityService.mapDtoWaterMeterToEntityAndRemoveDuplicate(waterMetersArray, uuidAuthsupa)
    
    // Enviar los medidores de agua al repositorio para inserción en la BD
    const result= await this.waterMeterRepository.submitAllWaterMeter(user.schemas.name, newWaterMetersArray);

    
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

/** ✅ Obtenero todos los medidores no sincronizados en el celular*/
  async getAllWaterMeters(AuthRequest: AuthRequest): Promise<{ 
    message: String,
    status:boolean,
    water_meters:WaterMeter[]
  }> {
    const user = AuthRequest.user;
    if (!user || !user.schemas || !user.schemas.name || !user.uuid_authsupa  ) {
      throw new HttpException('Usuario sin acueducto', HttpStatus.NOT_FOUND);
    }

    // Enviar los medidores de agua al repositorio para inserción en la BD
    const result= await this.waterMeterRepository.getAllWaterMeters(user.schemas.name,user.uuid_authsupa);

    if (!result.status) {
      throw new HttpException(
        {
          message: result.message,
          status: result.status,
          water_meters: result.water_meters
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
    
    return result; 
  }



  /** ✅ Sincronizar los tipos medidores de agua*/
  async syncWaterMeters(AuthRequest: AuthRequest, waterMeterArray: WaterMetersDto[]): Promise<{ 
    message: String,
    status: Boolean,
    syncronized: WaterMetersDto[],
    duplicated: WaterMetersDto[] | null   
}> {
    const user = AuthRequest.user;
    if (!user || !user.schemas || !user.schemas.name || !user.uuid_authsupa  ) {
      throw new HttpException('Usuario sin acueducto', HttpStatus.NOT_FOUND);
    }
    const uuidAuthsupa: string = user.uuid_authsupa;

    const waterMetersArrayFiltred = this.utilityService.removeDuplicateWaterMeter(waterMeterArray);

    // Enviar los medidores de aguea al repositorio para inserción en la BD
    const result= await this.waterMeterRepository.syncWaterMeter(user.schemas.name, uuidAuthsupa,waterMetersArrayFiltred);

          
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
