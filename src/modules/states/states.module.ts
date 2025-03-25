import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { State } from './state.entity';
import { StateRepository } from './states.repository';
import { StatesService  } from './states.service';
import { StatesController } from './states.controller';
import { AuthModule } from '../auth/auth.module';
import { SupabaseModule } from '../../config/supabase.module';
import { UtilityModule } from '../../shared/utility/utility.module';
import { UserModule } from '../users/users.module';
import { LoggerModule } from '../logger/logger.module';

@Module({
    imports: [
      TypeOrmModule.forFeature([State]),
      forwardRef(() => AuthModule),
      UtilityModule,
      SupabaseModule,
      UserModule,
      LoggerModule
    ],  
  providers: [StatesService,StateRepository],
  controllers: [StatesController],
  exports: [StateRepository, StatesService, TypeOrmModule],
})
export class StatesModule {}
