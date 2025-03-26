import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { TrailRepository } from './trail.repository';
import { TrailDto } from './dto/trail.dto';
import { Trail } from './trail.entity';
import { AuthRequest } from '../../types';
import { UtilityService } from '../../shared/utility/utility.service';

@Injectable()
export class TrailServices {

  constructor(
    private readonly trailRepository: TrailRepository,
    private readonly utilityService: UtilityService    
  ) {}
/** ✅ Obtener todas las rutas*/
  async submitAllTrails(AuthRequest: AuthRequest, trailsArray: TrailDto[]): Promise<{ 
      message: string,
      status: boolean,
      inserted: { 
        id: number;
        id_ruta: string;
        nombre: string;
       }[];
      duplicated: TrailDto[];    
      existing: TrailDto[];    
  }> {
    const user = AuthRequest.user;
    if (!user || !user.schemas || !user.schemas.name || !user.uuid_authsupa ) {
      throw new HttpException('Usuario sin acueducto', HttpStatus.NOT_FOUND);
    }
    const uuidAuthsupa: string = user.uuid_authsupa;
    // Mapear todos los DTOs a entidades    
    const newTrails = this.utilityService.mapDtoTrailsAndRemoveDuplicate(trailsArray, uuidAuthsupa)
    // Enviar las rutas al repositorio para inserción en la BD
    return await this.trailRepository.submitAllTrails(user.schemas.name, newTrails);

  }

    async getAllTrails(AuthRequest: AuthRequest): Promise<{ 
      message: String,
      status:boolean,
      trails:Trail[]
      }> {
      const user = AuthRequest.user;
      if (!user || !user.schemas || !user.schemas.name || !user.uuid_authsupa  ) {
        throw new HttpException('Usuario sin acueducto', HttpStatus.NOT_FOUND);
      }
      // Enviar las rutas al repositorio para inserción en la BD
      return await this.trailRepository.getAllTrails(user.schemas.name,user.uuid_authsupa);

    }
  
    /** ✅ Sincronizar rutas*/
    async syncTrails(AuthRequest: AuthRequest, trailsArray: TrailDto[]): Promise<{ 
      message: String,
      status: Boolean,
      duplicated: TrailDto[] | null    
  }> {
      const user = AuthRequest.user;
      if (!user || !user.schemas || !user.schemas.name || !user.uuid_authsupa  ) {
        throw new HttpException('Usuario sin acueducto', HttpStatus.NOT_FOUND);
      }
      const uuidAuthsupa: string = user.uuid_authsupa;
  
      const trailsArrayFiltred = this.utilityService.removeDuplicateTrails(trailsArray);
  
      // Enviar las rutas al repositorio para inserción en la BD
      return await  this.trailRepository.syncTrails(user.schemas.name, uuidAuthsupa,trailsArrayFiltred);
      
    }

}
