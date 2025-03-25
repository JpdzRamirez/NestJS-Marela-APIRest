import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WaterMeter } from './meters.entity';
import { WaterMeterRepository } from './meters.repository';
import { WaterMeterService  } from './meters.service';
import { WaterMeterController } from './meters.controller';
import { AuthModule } from '../auth/auth.module';
import { SupabaseModule } from '../../config/supabase.module';
import { UtilityModule } from '../../shared/utility/utility.module';
import { UserModule } from '../users/users.module';
import { LoggerModule } from '../logger/logger.module';

@Module({
    imports: [
      TypeOrmModule.forFeature([WaterMeter]),
      forwardRef(() => AuthModule),
      UtilityModule,
      SupabaseModule,
      UserModule,
      LoggerModule
    ],  
  providers: [WaterMeterService,WaterMeterRepository],
  controllers: [WaterMeterController],
  exports: [WaterMeterRepository, WaterMeterService, TypeOrmModule],
})
export class WaterMeterModule {}

