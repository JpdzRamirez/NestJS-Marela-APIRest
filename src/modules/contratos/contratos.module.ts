import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contrato } from './contrato.entity';

import { ContratosRepository } from './contratos.repository';
import { ContratosService } from './contratos.service';
import { ContratosController } from './contratos.controller';

import { FacturasModule } from '../../modules/facturas/facturas.module';
import { UtilityModule } from '../../shared/utility/utility.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
      TypeOrmModule.forFeature([Contrato]),
      forwardRef(() => AuthModule),
      UtilityModule,
      FacturasModule
   ], 
  providers: [ContratosService],
  controllers: [ContratosController],
  exports: [ContratosRepository, ContratosService, TypeOrmModule],
})
export class ContratosModule {}
