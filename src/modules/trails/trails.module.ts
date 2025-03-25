import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trail } from './trail.entity';
import { TrailRepository } from './trail.repository';
import { TrailServices  } from './trails.service';
import { TrailController } from './trails.controller';
import { AuthModule } from '../auth/auth.module';
import { SupabaseModule } from '../../config/supabase.module';
import { UtilityModule } from '../../shared/utility/utility.module';
import { UserModule } from '../users/users.module';
import { LoggerModule } from '../logger/logger.module';

@Module({
    imports: [
      TypeOrmModule.forFeature([Trail]),
      forwardRef(() => AuthModule),
      UtilityModule,
      SupabaseModule,
      UserModule,
      LoggerModule
    ],  
  providers: [TrailServices,TrailRepository],
  controllers: [TrailController],
  exports: [TrailRepository, TrailServices, TypeOrmModule],
})
export class TrailModule {}
