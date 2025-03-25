import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeService } from './type_service.entity';
import { TypeServiceRepository } from './type_services.repository';
import { TypeServicesService  } from './type_services.service';
import { TypeServicesController } from './type_services.controller';
import { AuthModule } from '../auth/auth.module';
import { SupabaseModule } from '../../config/supabase.module';
import { UtilityModule } from '../../shared/utility/utility.module';
import { UserModule } from '../users/users.module';
import { LoggerModule } from '../logger/logger.module';

@Module({
    imports: [
      TypeOrmModule.forFeature([TypeService]),
      forwardRef(() => AuthModule),
      UtilityModule,
      SupabaseModule,
      UserModule,
      LoggerModule
    ],  
  providers: [TypeServicesService,TypeServiceRepository],
  controllers: [TypeServicesController],
  exports: [TypeServiceRepository, TypeServicesService, TypeOrmModule],
})
export class TypeServicesModule {}
