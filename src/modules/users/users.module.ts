import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './User.entity';
import { UserRepository } from './users.repository';
import { SupabaseModule } from '../../config/supabase.module';
import { UserController } from './users.controller';
import { UsersService } from './users.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    SupabaseModule,
    forwardRef(() => AuthModule), // 🔹 Usamos `forwardRef`
  ],
  controllers: [UserController],
  providers: [UserRepository, UsersService],
  exports: [UserRepository, UsersService, TypeOrmModule],
})
export class UserModule {}
