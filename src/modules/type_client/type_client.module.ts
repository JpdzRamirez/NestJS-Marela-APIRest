import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeClient } from './type_client.entity';

import { TypeClientRepository } from './type_client.repository';
import { TypeClientServices  } from './type_client.service';
import { TypeClientController } from './type_client.controller';

import { AuthModule } from '../auth/auth.module';
import { SupabaseModule } from '../../config/supabase.module';
import { UtilityModule } from '../../shared/utility/utility.module';
import { UserModule } from '../users/users.module';
import { LoggerModule } from '../logger/logger.module';

@Module({
    imports: [
      TypeOrmModule.forFeature([TypeClient]),
      forwardRef(() => AuthModule),
      UtilityModule,
      SupabaseModule,
      UserModule,
      LoggerModule
    ],  
  providers: [TypeClientServices,TypeClientRepository],
  controllers: [TypeClientController],
  exports: [TypeClientRepository, TypeClientServices, TypeOrmModule],
})
export class TypeClientModule {}

