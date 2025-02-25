import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ContractRepository } from './contracts.repository';
import { Contract } from './contract.entity';

import { GetDateRangeContractsDto } from './dto/get-dateRangeContracts.dto';

import { AuthRequest } from '../../types';

@Injectable()
export class ContractServices {
  constructor(private readonly contractRepository: ContractRepository) {}

  async getAllContracts(AuthRequest: AuthRequest): Promise<Contract[]> {
    const user = AuthRequest.user;
    if (!user || !user.schemas || !user.schemas.name) {
      throw new HttpException('No se encontraro usuario', HttpStatus.NOT_FOUND);
    }

    const invoices = await this.contractRepository.getAllContracts(user.schemas.name,);

    if (!invoices) {
      throw new HttpException('Sin registros de facturas',HttpStatus.NOT_FOUND,);
    }
    return invoices;
  }

  /** ✅ Obtener facturas dentro rangos de fecha */
  async getDateRangeContracts(AuthRequest: AuthRequest,dateRange:GetDateRangeContractsDto): Promise<Contract[]> {
      const user = AuthRequest.user;
      if (!user || !user.schemas || !user.schemas.name ) {
        throw new HttpException('Usuario sin acueducto', HttpStatus.NOT_FOUND);
      }
  
      const invoices = await this.contractRepository.getDateRangeContracts(user.schemas.name,dateRange);
  
      if (!invoices) {
        throw new HttpException('Sin registros de contratos', HttpStatus.NOT_FOUND);
      }
      return invoices;
  }
}
