import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { TypeServiceRepository } from './type_services.repository';
import { TypeServiceDto } from './dto/type_services.dto';
import { TypeService } from './type_service.entity';
import { AuthRequest } from '../../types';
import { UtilityService } from '../../shared/utility/utility.service';

@Injectable()
export class TypeServicesService {

  constructor(
    private readonly typeServiceRepository: TypeServiceRepository,
    private readonly utilityService: UtilityService    
  ) {}
/** ✅ Subir todos los tipos de servicios*/
  async submitAllTypeServices(AuthRequest: AuthRequest, typeServicesArray: TypeServiceDto[]): Promise<{ 
      message: string,
      status: boolean,
      inserted: { 
        id: number;
        id_tiposervicio: string;
        nombre: string;   
        cargo_fijo: number;     
       }[];
      duplicated: TypeServiceDto[]; 
      existing: TypeServiceDto[];       
  }> {
    const user = AuthRequest.user;
    if (!user || !user.schemas || !user.schemas.name || !user.uuid_authsupa ) {
      throw new HttpException('Usuario sin acueducto', HttpStatus.NOT_FOUND);
    }
    const uuidAuthsupa: string = user.uuid_authsupa;
    // Mapear todos los DTOs a entidades    
    const newTypeServices = this.utilityService.mapDtoTypeServiceAndRemoveDuplicateEntity(typeServicesArray, uuidAuthsupa)
    // Enviar los clientes al repositorio para inserción en la BD
    const result= await this.typeServiceRepository.submitAllTypeServices(user.schemas.name, newTypeServices);

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

    async getAllTypeServices(AuthRequest: AuthRequest): Promise<{ 
      message: String,
      status:boolean,
      type_services:TypeService[]
      }> {
      const user = AuthRequest.user;
      if (!user || !user.schemas || !user.schemas.name || !user.uuid_authsupa  ) {
        throw new HttpException('Usuario sin acueducto', HttpStatus.NOT_FOUND);
      }
      // Enviar los clientes al repositorio para inserción en la BD
      const result= await this.typeServiceRepository.getAllTypeServices(user.schemas.name,user.uuid_authsupa);

      if (!result.status) {
        throw new HttpException(
          {
            message: result.message,
            status: result.status,
            type_services: result.type_services
          },
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
      
      return result; 
    }
  
    /** ✅ Sincronizar los tipos de clientes*/
    async syncTypeServices(AuthRequest: AuthRequest, typeServicesArray: TypeServiceDto[]): Promise<{ 
      message: String,
      status: Boolean,
      syncronized: TypeServiceDto[],
      duplicated: TypeServiceDto[] | null    
  }> {
      const user = AuthRequest.user;
      if (!user || !user.schemas || !user.schemas.name || !user.uuid_authsupa  ) {
        throw new HttpException('Usuario sin acueducto', HttpStatus.NOT_FOUND);
      }
      const uuidAuthsupa: string = user.uuid_authsupa;
  
      const typeServicesArrayFiltred = this.utilityService.removeDuplicateTypeServices(typeServicesArray);
  
      // Enviar los tipos de servicios al repositorio para inserción en la BD
      const result= await this.typeServiceRepository.syncTypeServices(user.schemas.name, uuidAuthsupa,typeServicesArrayFiltred);
      
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
