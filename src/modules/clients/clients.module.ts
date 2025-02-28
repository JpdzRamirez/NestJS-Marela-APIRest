import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from './client.entity';

import { ClientRepository } from './client.repository';
import { ClientServices  } from './clients.service';
import { ClientController } from './clients.controller';

import { AuthModule } from '../auth/auth.module';
import { SupabaseModule } from '../../config/supabase.module';
import { UtilityModule } from '../../shared/utility/utility.module';
import { UserModule } from '../users/users.module';

@Module({
    imports: [
      TypeOrmModule.forFeature([Client]),
      forwardRef(() => AuthModule),
      UtilityModule,
      SupabaseModule,
      UserModule
    ],  
  providers: [ClientServices,ClientRepository],
  controllers: [ClientController],
  exports: [ClientRepository, ClientServices, TypeOrmModule],
})
export class ClientModule {}
