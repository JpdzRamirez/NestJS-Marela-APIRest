import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ProductsActivityRepository } from './products_activity.repository';
import { ProductsActivityDto } from './dto/products_activity.dto';
import { ProductsActivity } from './products_activity.entity';
import { AuthRequest } from '../../types';
import { UtilityService } from '../../shared/utility/utility.service';

@Injectable()
export class ProductsActivityService {

  constructor(
    private readonly productsActivityRepository: ProductsActivityRepository,
    private readonly utilityService: UtilityService    
  ) {}


  /** ✅ Obtener todas las Productos actividad*/
    async submitAllProductsActivity(AuthRequest: AuthRequest, productsActivityArray: ProductsActivityDto[]): Promise<{ 
        message: string,
        status: boolean,
        inserted: { 
          id: number;
          id_productosactividad: string;
          nombre: string;
          codigo: number;
         }[];
        duplicated: ProductsActivityDto[]; 
        existing: ProductsActivityDto[];       
    }> {
      const user = AuthRequest.user;
      if (!user || !user.schemas || !user.schemas.name || !user.uuid_authsupa ) {
        throw new HttpException('Usuario sin acueducto', HttpStatus.NOT_FOUND);
      }
      const uuidAuthsupa: string = user.uuid_authsupa;
      // Mapear todos los DTOs a entidades    
      const newProductsActivity = this.utilityService.mapDtoProductsActivityToEntityAndRemoveDuplicate(productsActivityArray, uuidAuthsupa)
      // Enviar las productos actividad al repositorio para inserción en la BD
      return await this.productsActivityRepository.submitAllProductsActivity(user.schemas.name, newProductsActivity);
    
    }

    async getAllProductsActivity(AuthRequest: AuthRequest): Promise<{ 
          message: String,
          status:boolean,
          products_activity:ProductsActivity[]
    }> {
        const user = AuthRequest.user;
        if (!user || !user.schemas || !user.schemas.name || !user.uuid_authsupa  ) {
            throw new HttpException('Usuario sin acueducto', HttpStatus.NOT_FOUND);
        }
          // Enviar los productos actividad al repositorio para inserción en la BD
          return await this.productsActivityRepository.getAllProductsActivity(user.schemas.name,user.uuid_authsupa);
    
    }

        /** ✅ Sincronizar las productos actividad*/
        async syncProductsActivity(AuthRequest: AuthRequest, productsActivityArray: ProductsActivityDto[]): Promise<{ 
          message: String,
          status: Boolean,
          syncronized: ProductsActivityDto[],
          duplicated: ProductsActivityDto[] | null    
      }> {
          const user = AuthRequest.user;
          if (!user || !user.schemas || !user.schemas.name || !user.uuid_authsupa  ) {
            throw new HttpException('Usuario sin acueducto', HttpStatus.NOT_FOUND);
          }
          const uuidAuthsupa: string = user.uuid_authsupa;
      
          const productsActivityArrayFiltred = this.utilityService.removeProductsActivity(productsActivityArray);
      
          // Enviar las productos actividad al repositorio para inserción en la BD
          return await this.productsActivityRepository.syncProductsActivity(user.schemas.name, uuidAuthsupa,productsActivityArrayFiltred);
      
        }
}
