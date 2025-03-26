import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { OverdueDebtRepository } from './overdue_debt.repository';
import { OverdueDebtDto } from './dto/overdue_debt.dto';
import { OverdueDebt } from './overdue_debt.entity';
import { AuthRequest } from '../../types';
import { UtilityService } from '../../shared/utility/utility.service';

@Injectable()
export class OverdueDebtService {

     constructor(
        private readonly overdueDebtRepository: OverdueDebtRepository,
        private readonly utilityService: UtilityService    
      ) {}
    /** ✅ Subir todas las moras*/
      async submitAllOverdueDebt(AuthRequest: AuthRequest, overDueDebtArray: OverdueDebtDto[]): Promise<{ 
          message: string,
          status: boolean,
          inserted: { 
            id: number;
            id_mora: string;            
            nombre_mora: string;
           }[];
          duplicated: OverdueDebtDto[]; 
          existing: OverdueDebtDto[];       
      }> {
        const user = AuthRequest.user;
        if (!user || !user.schemas || !user.schemas.name || !user.uuid_authsupa ) {
          throw new HttpException('Usuario sin acueducto', HttpStatus.NOT_FOUND);
        }
        const uuidAuthsupa: string = user.uuid_authsupa;
        // Mapear todos los DTOs a entidades    
        const newCities = this.utilityService.mapDtoOverDueDebtAndRemoveDuplicate(overDueDebtArray, uuidAuthsupa)
        // Enviar las moras al repositorio para inserción en la BD
        return await this.overdueDebtRepository.submitAllOverdueDebt(user.schemas.name, newCities);
      
      }
    
        async getAllOverdueDebt(AuthRequest: AuthRequest): Promise<{ 
          message: String,
          status:boolean,
          overdue_debts:OverdueDebt[]
          }> {
          const user = AuthRequest.user;
          if (!user || !user.schemas || !user.schemas.name || !user.uuid_authsupa  ) {
            throw new HttpException('Usuario sin acueducto', HttpStatus.NOT_FOUND);
          }
          // Enviar los moras al repositorio para inserción en la BD
          return await this.overdueDebtRepository.getAllOverdueDebt(user.schemas.name,user.uuid_authsupa);
    
        }
      
        /** ✅ Sincronizar las moras*/
        async syncOverdueDebt(AuthRequest: AuthRequest, overDueDebtArray: OverdueDebtDto[]): Promise<{ 
          message: String,
          status: Boolean,
          syncronized: OverdueDebtDto[],
          duplicated: OverdueDebtDto[] | null    
      }> {
          const user = AuthRequest.user;
          if (!user || !user.schemas || !user.schemas.name || !user.uuid_authsupa  ) {
            throw new HttpException('Usuario sin acueducto', HttpStatus.NOT_FOUND);
          }
          const uuidAuthsupa: string = user.uuid_authsupa;
      
          const overDueDebtArrayFiltred = this.utilityService.removeDuplicateOverdueDebt(overDueDebtArray);
      
          // Enviar las moras al repositorio para inserción en la BD
          return await this.overdueDebtRepository.syncOverdueDebt(user.schemas.name, uuidAuthsupa,overDueDebtArrayFiltred);
      
        }

}
