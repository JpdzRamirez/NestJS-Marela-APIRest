import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeDocument } from './type_document.entity';

import { TypeDocumentRepository } from './type_document.repository';
import { TypeDocumentServices  } from './type_document.service';
import { TypeDocumentController } from './type_document.controller';

import { AuthModule } from '../auth/auth.module';
import { SupabaseModule } from '../../config/supabase.module';
import { UtilityModule } from '../../shared/utility/utility.module';
import { UserModule } from '../users/users.module';

@Module({
    imports: [
      TypeOrmModule.forFeature([TypeDocument]),
      forwardRef(() => AuthModule),
      UtilityModule,
      SupabaseModule,
      UserModule
    ],  
  providers: [TypeDocumentServices,TypeDocumentRepository],
  controllers: [TypeDocumentController],
  exports: [TypeDocumentRepository, TypeDocumentServices, TypeOrmModule],
})
export class TypeDocumentModule {}

