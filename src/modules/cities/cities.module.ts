import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { City } from './city.entity';

import { CityRepository } from './cities.repository';
import { CityServices  } from './cities.service';
import { CitiesController } from './cities.controller';

import { AuthModule } from '../auth/auth.module';
import { SupabaseModule } from '../../config/supabase.module';
import { UtilityModule } from '../../shared/utility/utility.module';
import { UserModule } from '../users/users.module';

@Module({
    imports: [
      TypeOrmModule.forFeature([City]),
      forwardRef(() => AuthModule),
      UtilityModule,
      SupabaseModule,
      UserModule
    ],  
  providers: [CityServices,CityRepository],
  controllers: [CitiesController],
  exports: [CityRepository, CityServices, TypeOrmModule],
})
export class CitiesModule {}
