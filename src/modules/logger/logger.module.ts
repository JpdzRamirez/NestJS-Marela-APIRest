import { Module } from '@nestjs/common';
import { LoggerServices } from './logger.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // Carga .env globalmente
  ],
  providers: [LoggerServices],
  exports:[LoggerServices]
})
export class LoggerModule {}
