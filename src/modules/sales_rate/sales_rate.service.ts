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
/** ✅ Obtener todas las facturas*/
  async submitAllSalesRate(AuthRequest: AuthRequest, salesRateArray: SalesDto[]): Promise<{ 
      message: string,
      status: boolean,
      inserted: { id: number; id_tarifa: string; nombre: string }[];
      duplicated: SalesDto[];      
  }> {
    const user = AuthRequest.user;
    if (!user || !user.schemas || !user.schemas.name || !user.uuid_authsupa ) {
      throw new HttpException('Usuario sin acueducto', HttpStatus.NOT_FOUND);
    }
    const uuidAuthsupa: string = user.uuid_authsupa;

    const newMunicipalUnits = this.utilityService.mapDtoSalesRateAndRemoveDuplicate(salesRateArray, uuidAuthsupa)

    return await this.salesRateRepository.submitAllSalesRate(user.schemas.name, newMunicipalUnits);

  }

    async getAllSalesRate(AuthRequest: AuthRequest): Promise<{ 
      message: String,
      municipal_units:SalesRate[]
      }> {
      const user = AuthRequest.user;
      if (!user || !user.schemas || !user.schemas.name || !user.uuid_authsupa  ) {
        throw new HttpException('Usuario sin acueducto', HttpStatus.NOT_FOUND);
      }
      // Enviar los clientes al repositorio para inserción en la BD
      return await this.salesRateRepository.getAllSalesRate(user.schemas.name,user.uuid_authsupa);
    }
  
  
  
    /** ✅ Sincronizar las tarifas*/
    async syncSalesRate(AuthRequest: AuthRequest, salesRateArray: SalesDto[]): Promise<{ 
      message: String,
      status: Boolean,
      duplicated: SalesDto[] | null    
  }> {
      const user = AuthRequest.user;
      if (!user || !user.schemas || !user.schemas.name || !user.uuid_authsupa  ) {
        throw new HttpException('Usuario sin acueducto', HttpStatus.NOT_FOUND);
      }
      const uuidAuthsupa: string = user.uuid_authsupa;
  
      const salesRateArrayFiltred = this.utilityService.removeDuplicateSalesRate(salesRateArray);
  
      // Enviar los clientes al repositorio para inserción en la BD
      return await this.salesRateRepository.syncSalesRate(user.schemas.name, uuidAuthsupa,salesRateArrayFiltred);
  
    }

}
