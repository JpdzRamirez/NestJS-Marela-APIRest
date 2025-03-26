import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsActivity } from './products_activity.entity';
import { ProductsActivityRepository } from './products_activity.repository';
import { ProductsActivityService  } from './products_activity.service';
import { ProductsActivityController } from './products_activity.controller';
import { AuthModule } from '../auth/auth.module';
import { SupabaseModule } from '../../config/supabase.module';
import { UtilityModule } from '../../shared/utility/utility.module';
import { UserModule } from '../users/users.module';
import { LoggerModule } from '../logger/logger.module';

@Module({
    imports: [
      TypeOrmModule.forFeature([ProductsActivity]),
      forwardRef(() => AuthModule),
      UtilityModule,
      SupabaseModule,
      UserModule,
      LoggerModule
    ],  
  providers: [ProductsActivityService,ProductsActivityRepository],
  controllers: [ProductsActivityController],
  exports: [ProductsActivityRepository, ProductsActivityService, TypeOrmModule],
})
export class ProductsActivityModule {}
