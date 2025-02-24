import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Factura } from './factura.entity';

import { FacturasRepository } from './facturas.repository';
import { FacturasServices } from './facturas.service';
import { FacturasController } from './facturas.controller';

import { AuthModule } from '../auth/auth.module';
import { UtilityModule } from '../../shared/utility/utility.module';
import { ContratosModule } from '../../modules/contratos/contratos.module';

@Module({
    imports: [
      TypeOrmModule.forFeature([Factura]),
      forwardRef(() => AuthModule),
      UtilityModule,
      ContratosModule
    ],  
  providers: [FacturasServices],
  controllers: [FacturasController],
  exports: [FacturasRepository, FacturasServices, TypeOrmModule],
})
export class FacturasModule {}
