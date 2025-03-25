import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { SalesRateRepository } from './sales.repository';
import { SalesDto } from './dto/sales.dto';

import { SalesRate } from './sales_rate.entity';
import { AuthRequest } from '../../types';

import { UtilityService } from '../../shared/utility/utility.service';

@Injectable()
export class SalesRateService {
  constructor(
    private readonly salesRateRepository: SalesRateRepository,
    private readonly utilityService: UtilityService    
  ) {}
/** ✅ Obtener todas las tarifas*/
  async submitAllSalesRate(AuthRequest: AuthRequest, salesRateArray: SalesDto[]): Promise<{ 
      message: string,
      status: boolean,
      inserted: { 
        id: number;
        id_tarifa: string;
        nombre: string 
      }[];
      duplicated: SalesDto[];   
      existing: SalesDto[];   
  }> {
    const user = AuthRequest.user;
    if (!user || !user.schemas || !user.schemas.name || !user.uuid_authsupa ) {
      throw new HttpException('Usuario sin acueducto', HttpStatus.NOT_FOUND);
    }
    const uuidAuthsupa: string = user.uuid_authsupa;

    const newMunicipalUnits = this.utilityService.mapDtoSalesRateAndRemoveDuplicate(salesRateArray, uuidAuthsupa)

    const result= await this.salesRateRepository.submitAllSalesRate(user.schemas.name, newMunicipalUnits);

    
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

    async getAllSalesRate(AuthRequest: AuthRequest): Promise<{ 
      message: String,
      status:boolean,
      municipal_units:SalesRate[]
      }> {
      const user = AuthRequest.user;
      if (!user || !user.schemas || !user.schemas.name || !user.uuid_authsupa  ) {
        throw new HttpException('Usuario sin acueducto', HttpStatus.NOT_FOUND);
      }
      // Enviar los clientes al repositorio para inserción en la BD
      const result= await this.salesRateRepository.getAllSalesRate(user.schemas.name,user.uuid_authsupa);

      if (!result.status) {
        throw new HttpException(
          {
            message: result.message,
            status: result.status,
            municipal_units: result.municipal_units
          },
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
      
      return result; 
    }
  
  
  
    /** ✅ Sincronizar las tarifas*/
    async syncSalesRate(AuthRequest: AuthRequest, salesRateArray: SalesDto[]): Promise<{ 
      message: String,
      status: Boolean,
      syncronized: SalesDto[],
      duplicated: SalesDto[] | null    
  }> {
      const user = AuthRequest.user;
      if (!user || !user.schemas || !user.schemas.name || !user.uuid_authsupa  ) {
        throw new HttpException('Usuario sin acueducto', HttpStatus.NOT_FOUND);
      }
      const uuidAuthsupa: string = user.uuid_authsupa;
  
      const salesRateArrayFiltred = this.utilityService.removeDuplicateSalesRate(salesRateArray);
  
      // Enviar los tarifas al repositorio para inserción en la BD
      const result= await this.salesRateRepository.syncSalesRate(user.schemas.name, uuidAuthsupa,salesRateArrayFiltred);      
            
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
