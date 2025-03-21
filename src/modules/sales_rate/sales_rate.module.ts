import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalesRate } from './sales_rate.entity';

import { SalesRateRepository } from './sales.repository';
import { SalesRateService  } from './sales_rate.service';
import { SalesRateController } from './sales_rate.controller';

import { AuthModule } from '../auth/auth.module';
import { SupabaseModule } from '../../config/supabase.module';
import { UtilityModule } from '../../shared/utility/utility.module';
import { UserModule } from '../users/users.module';

@Module({
    imports: [
      TypeOrmModule.forFeature([SalesRate]),
      forwardRef(() => AuthModule),
      UtilityModule,
      SupabaseModule,
      UserModule
    ],  
  providers: [SalesRateService,SalesRateRepository],
  controllers: [SalesRateController],
  exports: [SalesRateRepository, SalesRateService, TypeOrmModule],
})
export class SalesRateModule {}
