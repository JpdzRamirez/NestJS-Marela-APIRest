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
      status:boolean
      contracts:Contract[]
    }>  {
    const user = AuthRequest.user;
    if (!user || !user.schemas || !user.schemas.name || !user.uuid_authsupa  ) {
      throw new HttpException('Usuario sin autorizacion', HttpStatus.NOT_FOUND);
    }

    const result= await this.contractRepository.getAllContracts(user.schemas.name,user.uuid_authsupa);

    if (!result.status) {
      throw new HttpException(
        {
          message: result.message,
          status: result.status,
          contracts: result.contracts
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
    
    return result;
  }

  /** ✅ Obtener contratos dentro rangos de fecha */
  async getDateRangeContracts(AuthRequest: AuthRequest,dateRange:GetDateRangeContractsDto): Promise<{ 
    message: String,
    status:boolean,
    contracts:Contract[]
  }>  {
      const user = AuthRequest.user;
      if (!user || !user.schemas || !user.schemas.name || !user.uuid_authsupa ) {
        throw new HttpException('Usuario sin acueducto', HttpStatus.NOT_FOUND);
      }
      const result= await this.contractRepository.getDateRangeContracts(user.schemas.name,dateRange,user.uuid_authsupa);
    
      if (!result.status) {
        throw new HttpException(
          {
            message: result.message,
            status: result.status,
            contracts: result.contracts
          },
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
      
      return result;
  }

  async submitAllContracts(AuthRequest: AuthRequest, contractsArray: ContractsDto[]): Promise<{ 
      message: string;
      status: boolean;
      inserted: { 
        id: number; 
        id_contrato: string;
        fecha: Date }[];
      duplicated: ContractsDto[];
      existing: ContractsDto[];   
  }>{
      const user = AuthRequest.user;
      if (!user || !user.schemas || !user.schemas.name || !user.uuid_authsupa  ) {
        throw new HttpException('Usuario sin acueducto', HttpStatus.NOT_FOUND);
      }
      const uuidAuthsupa: string = user.uuid_authsupa;
      // Mapear todos los DTOs a entidades
      const newContractsArray = this.utilityService.mapDtoContractsToEntityAndRemoveDuplicate(contractsArray, uuidAuthsupa)
      
      // Enviar los contratos al repositorio para inserción en la BD
      const result= await this.contractRepository.submitAllContracts(user.schemas.name, newContractsArray);  

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

  /** ✅ Sincronizar los contratos*/
  async syncContracts(AuthRequest: AuthRequest, contractsArray: ContractsDto[]): Promise<{ 
      message: String,
      status: Boolean,
      syncronized: ContractsDto[],
      duplicated: ContractsDto[] | null   
  }>{
      const user = AuthRequest.user;
      if (!user || !user.schemas || !user.schemas.name || !user.uuid_authsupa  ) {
        throw new HttpException('Usuario sin acueducto', HttpStatus.NOT_FOUND);
      }
      const uuidAuthsupa: string = user.uuid_authsupa;
  
      const contractsArrayFiltred = this.utilityService.removeDuplicateContracts(contractsArray);
  
      // Enviar los clientes al repositorio para inserción en la BD
      const result= await this.contractRepository.syncContracts(user.schemas.name, uuidAuthsupa,contractsArrayFiltred);

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
