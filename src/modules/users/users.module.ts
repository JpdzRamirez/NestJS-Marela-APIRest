import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserRepository } from './users.repository';
import { SupabaseModule } from '../../config/supabase.module';
import { UserController } from './users.controller';
import { UserServices } from './users.service';
import { AuthModule } from '../auth/auth.module';
import { UtilityModule } from '../../shared/utility/utility.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    SupabaseModule,
    forwardRef(() => AuthModule),
    UtilityModule
  ],
  controllers: [UserController],
  providers: [UserRepository, UserServices],
  exports: [UserRepository, UserServices, TypeOrmModule],
})
export class UserModule {}
