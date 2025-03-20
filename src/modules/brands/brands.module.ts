import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Brand } from './brand.entity';

import { BrandRepository } from './brands.repository';
import { BrandsService  } from './brands.service';
import { BrandsController } from './brands.controller';

import { AuthModule } from '../auth/auth.module';
import { SupabaseModule } from '../../config/supabase.module';
import { UtilityModule } from '../../shared/utility/utility.module';
import { UserModule } from '../users/users.module';

@Module({
    imports: [
      TypeOrmModule.forFeature([Brand]),
      forwardRef(() => AuthModule),
      UtilityModule,
      SupabaseModule,
      UserModule
    ],  
  providers: [BrandsService,BrandRepository],
  controllers: [BrandsController],
  exports: [BrandRepository, BrandsService, TypeOrmModule],
})
export class BrandsModule {}
