import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './config/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/users/users.module';
import { UtilityModule } from './shared/utility/utility.module';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { ContractsModule } from './modules/contracts/contracts.module';
import { SchemasService } from './modules/schemas/schemas.service';
import { SchemasModule } from './modules/schemas/schemas.module';
import { TypeClientService } from './modules/type_client/type_client.service';
import { TypeClientController } from './modules/type_client/type_client.controller';
import { TypeClientModule } from './modules/type_client/type_client.module';
import { ClientService } from './modules/client/client.service';
import { ClientController } from './modules/client/client.controller';
import { ClientModule } from './modules/client/client.module';
import { TypeDocumentService } from './modules/type_document/type_document.service';
import { TypeDocumentController } from './modules/type_document/type_document.controller';
import { TypeDocumentModule } from './modules/type_document/type_document.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }), // 🔹 Carga variables de entorno desde `.env`
    DatabaseModule,
    AuthModule,
    UserModule,
    UtilityModule,
    InvoicesModule,
    ContractsModule,
    SchemasModule,
    TypeClientModule,
    ClientModule,
    TypeDocumentModule,
  ],
  controllers: [AppController, TypeClientController, ClientController, TypeDocumentController],
  providers: [AppService, SchemasService, TypeClientService, ClientService, TypeDocumentService],
})
export class AppModule {}
