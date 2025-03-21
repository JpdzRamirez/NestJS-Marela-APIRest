import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ContractRepository } from './contracts.repository';
import { Contract } from './contract.entity';

import { ContractsDto, GetDateRangeContractsDto } from './dto/contracts.dto';

import { AuthRequest } from '../../types';

import { UtilityService } from '../../shared/utility/utility.service';

@Injectable()
export class ContractServices {
  constructor(
    private readonly contractRepository: ContractRepository,
    private readonly utilityService: UtilityService 
  ) {}

  /** ✅ Obtener contratos dentro rangos de fecha */
  async getAllContracts(AuthRequest: AuthRequest): Promise<{ 
      message: String,
      contracts:Contract[]
    }>  {
    const user = AuthRequest.user;
    if (!user) {
      throw new HttpException('Usuario no autenticado', HttpStatus.UNAUTHORIZED); // 401
    }

    if (!user.schemas || !user.schemas.name || !user.uuid_authsupa) {
      throw new HttpException('Datos de usuario incompletos', HttpStatus.BAD_REQUEST); // 400
    }

    const contracts= await this.contractRepository.getAllContracts(user.schemas.name,user.uuid_authsupa);

    if (!contracts || contracts.contracts.length === 0) {
      throw new HttpException('No se encontraron contratos', HttpStatus.NOT_FOUND); // 404
    }
    
    return contracts;
  }

  /** ✅ Obtener contratos dentro rangos de fecha */
  async getDateRangeContracts(AuthRequest: AuthRequest,dateRange:GetDateRangeContractsDto): Promise<{ 
    message: String,
    contracts:Contract[]
  }>  {
      const user = AuthRequest.user;
      if (!user || !user.schemas || !user.schemas.name || !user.uuid_authsupa ) {
        throw new HttpException('Usuario sin acueducto', HttpStatus.NOT_FOUND);
      }
      return await this.contractRepository.getDateRangeContracts(user.schemas.name,dateRange,user.uuid_authsupa);
  }

  async submitAllContracts(AuthRequest: AuthRequest, contractsArray: ContractsDto[]): Promise<{ 
      message: string;
      status: boolean;
      inserted: { id: number; id_contrato: string ; fecha: Date }[];
      duplicated: ContractsDto[];
  }>{
      const user = AuthRequest.user;
      if (!user || !user.schemas || !user.schemas.name || !user.uuid_authsupa  ) {
        throw new HttpException('Usuario sin acueducto', HttpStatus.NOT_FOUND);
      }
      const uuidAuthsupa: string = user.uuid_authsupa;
      // Mapear todos los DTOs a entidades
      const newContractsArray = this.utilityService.mapDtoContractsToEntityAndRemoveDuplicate(contractsArray, uuidAuthsupa)
      
      // Enviar los clientes al repositorio para inserción en la BD
      return await this.contractRepository.submitAllContracts(user.schemas.name, newContractsArray);  
  }

  /** ✅ Sincronizar los contratos*/
  async syncContracts(AuthRequest: AuthRequest, contractsArray: ContractsDto[]): Promise<{ 
      message: String,
      status: Boolean,
      duplicated: ContractsDto[] | null   
  }>{
      const user = AuthRequest.user;
      if (!user || !user.schemas || !user.schemas.name || !user.uuid_authsupa  ) {
        throw new HttpException('Usuario sin acueducto', HttpStatus.NOT_FOUND);
      }
      const uuidAuthsupa: string = user.uuid_authsupa;
  
      const contractsArrayFiltred = this.utilityService.removeDuplicateContracts(contractsArray);
  
      // Enviar los clientes al repositorio para inserción en la BD
      return await this.contractRepository.syncContracts(user.schemas.name, uuidAuthsupa,contractsArrayFiltred);
  
  }
}
