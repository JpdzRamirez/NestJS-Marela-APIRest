import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Unit } from './units.entity';

import { UnitsRepository } from './units.repository';
import { UnitsService  } from './units.service';
import { UnitsController } from './units.controller';

import { AuthModule } from '../auth/auth.module';
import { SupabaseModule } from '../../config/supabase.module';
import { UtilityModule } from '../../shared/utility/utility.module';
import { UserModule } from '../users/users.module';


@Module({
    imports: [
      TypeOrmModule.forFeature([Unit]),
      forwardRef(() => AuthModule),
      UtilityModule,
      SupabaseModule,
      UserModule
    ],  
  providers: [UnitsService,UnitsRepository],
  controllers: [UnitsController],
  exports: [UnitsRepository, UnitsService, TypeOrmModule],
})
export class UnitsModule {}
