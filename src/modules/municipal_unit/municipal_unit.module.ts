import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MunicipalUnit } from './municipal_unit.entity';

import { MunicipalUnitRepository } from './municipal_unit.repository';
import { MunicipalUnitService  } from './municipal_unit.service';
import { MunicipalUnitController } from './municipal_unit.controller';

import { AuthModule } from '../auth/auth.module';
import { SupabaseModule } from '../../config/supabase.module';
import { UtilityModule } from '../../shared/utility/utility.module';
import { UserModule } from '../users/users.module';
@Module({
    imports: [
      TypeOrmModule.forFeature([MunicipalUnit]),
      forwardRef(() => AuthModule),
      UtilityModule,
      SupabaseModule,
      UserModule
    ],  
  providers: [MunicipalUnitService,MunicipalUnitRepository],
  controllers: [MunicipalUnitController],
  exports: [MunicipalUnitRepository, MunicipalUnitService, TypeOrmModule],
})
export class MunicipalUnitModule {}
