import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contrato } from '../contratos/contrato.entity';


@Injectable()
export class ContratosRepository {
  constructor(    
    @InjectRepository(Contrato) private readonly contratoRepository: Repository<Contrato> // ✅ Inyectamos el repositorio de TypeORM
  ) {}

    /** ✅
     * Obtiene todas las facturas
    */
    async getAllContracts(): Promise<Contrato[]> {
      try {
        return await this.contratoRepository.find({ relations: ['facturas'] });
      } catch (error) {
        console.error('❌ Error en getAllUsers:', error);
        throw error;
      }
    }

};