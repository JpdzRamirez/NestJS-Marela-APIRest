import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invoice } from './invoice.entity';
import { InvoiceRepository } from './invoices.repository';
import { InvoiceServices } from './invoices.service';
import { InvoiceController } from './invoices.controller';
import { AuthModule } from '../auth/auth.module';
import { SupabaseModule } from '../../config/supabase.module';
import { UtilityModule } from '../../shared/utility/utility.module';
import { ContractsModule } from '../contracts/contracts.module';
import { UserModule } from '../users/users.module';
import { LoggerModule } from '../logger/logger.module';

@Module({
    imports: [
      TypeOrmModule.forFeature([Invoice]),
      forwardRef(() => AuthModule),
      forwardRef(() => ContractsModule),
      UtilityModule,
      SupabaseModule,
      UserModule,
      LoggerModule
    ],  
  providers: [InvoiceServices,InvoiceRepository],
  controllers: [InvoiceController],
  exports: [InvoiceRepository, InvoiceServices, TypeOrmModule],
})
export class InvoicesModule {}
