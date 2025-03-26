import { Module,forwardRef } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { LoggerModule } from '../logger/logger.module';
import { AuthModule } from '../auth/auth.module';
import { SupabaseModule } from '../../config/supabase.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from '../roles/role.entity';

@Module({
  imports: [
      TypeOrmModule.forFeature([Role]),
      SupabaseModule,
      forwardRef(() => AuthModule),      
      LoggerModule
  ],
  providers: [RolesService],
  controllers: [RolesController]
})
export class RolesModule {}
