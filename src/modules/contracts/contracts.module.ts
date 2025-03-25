import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contract } from './contract.entity';
import { ContractRepository } from './contracts.repository';
import { ContractServices } from './contracts.service';
import { UserModule } from '../users/users.module';
import { ContractController } from './contracts.controller';
import { SupabaseModule } from '../../config/supabase.module';
import { InvoicesModule } from '../invoices/invoices.module';
import { UtilityModule } from '../../shared/utility/utility.module';
import { AuthModule } from '../auth/auth.module';
import { LoggerModule } from '../logger/logger.module';

@Module({
  imports: [
      TypeOrmModule.forFeature([Contract]),
      forwardRef(() => AuthModule),
      forwardRef(() => InvoicesModule),
      UtilityModule,
      SupabaseModule,
      UserModule,
      LoggerModule
   ], 
  providers: [ContractServices,ContractRepository],
  controllers: [ContractController],
  exports: [ContractRepository, ContractServices, TypeOrmModule],
})
export class ContractsModule {}
