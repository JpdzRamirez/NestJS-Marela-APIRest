import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './config/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/users/users.module';
import { UtilityModule } from './shared/utility/utility.module';
import { FacturasModule } from './modules/facturas/facturas.module';
import { ContratosModule } from './modules/contratos/contratos.module';

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
    FacturasModule,
    ContratosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
