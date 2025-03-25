import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { typeOrmConfig,secondTypeOrmConfig  } from './typeorm.config';

@Module({
  imports: [
    ConfigModule,
   // Primera conexión (PostgreSQL)
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => typeOrmConfig(configService),
    }),
    // Segunda conexión (MySQL)
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      name: 'mysqlConnection', // 🔹 Nombre para identificar la conexión
      useFactory: async (configService: ConfigService) => secondTypeOrmConfig(configService),
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
