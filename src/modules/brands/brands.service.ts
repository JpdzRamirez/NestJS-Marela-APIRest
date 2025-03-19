import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { BrandRepository } from './brands.repository';
import { BrandDto } from './dto/brand.dto';

import { Brand } from './brand.entity';
import { AuthRequest } from '../../types';

import { UtilityService } from '../../shared/utility/utility.service';

@Injectable()
export class BrandsService {

  constructor(
    private readonly brandRepository: BrandRepository,
    private readonly utilityService: UtilityService    
  ) {}
/** ✅ Obtener todas las facturas*/
  async submitAllBrands(AuthRequest: AuthRequest, brandsArray: BrandDto[]): Promise<{ 
      message: string,
      status: boolean,
      inserted: { 
        id: number;
        id_marca: string;
        nombre: string;
       }[];
      duplicated: BrandDto[];      
  }> {
    const user = AuthRequest.user;
    if (!user || !user.schemas || !user.schemas.name || !user.uuid_authsupa ) {
      throw new HttpException('Usuario sin acueducto', HttpStatus.NOT_FOUND);
    }
    const uuidAuthsupa: string = user.uuid_authsupa;
    // Mapear todos los DTOs a entidades    
    const newMunicipalUnits = this.utilityService.mapDtoBrandAndRemoveDuplicateEntity(brandsArray, uuidAuthsupa)
    // Enviar los clientes al repositorio para inserción en la BD
    return await this.brandRepository.submitAllBrands(user.schemas.name, newMunicipalUnits);

  }

    async getAllBrands(AuthRequest: AuthRequest): Promise<{ 
      message: String,
      brands:Brand[]
      }> {
      const user = AuthRequest.user;
      if (!user || !user.schemas || !user.schemas.name || !user.uuid_authsupa  ) {
        throw new HttpException('Usuario sin acueducto', HttpStatus.NOT_FOUND);
      }
      // Enviar los clientes al repositorio para inserción en la BD
      return await this.brandRepository.getAllBrands(user.schemas.name,user.uuid_authsupa);
    }
  
    /** ✅ Sincronizar los tipos de clientes*/
    async syncBrands(AuthRequest: AuthRequest, brandsArray: BrandDto[]): Promise<{ 
      message: String,
      status: Boolean,
      duplicated: BrandDto[] | null    
  }> {
      const user = AuthRequest.user;
      if (!user || !user.schemas || !user.schemas.name || !user.uuid_authsupa  ) {
        throw new HttpException('Usuario sin acueducto', HttpStatus.NOT_FOUND);
      }
      const uuidAuthsupa: string = user.uuid_authsupa;
  
      const citiesArrayFiltred = this.utilityService.removeDuplicateBrands(brandsArray);
  
      // Enviar los clientes al repositorio para inserción en la BD
      return await this.brandRepository.syncBrands(user.schemas.name, uuidAuthsupa,citiesArrayFiltred);
  
    }

}
