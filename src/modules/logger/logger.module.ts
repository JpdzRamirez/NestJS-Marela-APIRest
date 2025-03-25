import { Module } from '@nestjs/common';
import { LoggerServices } from './logger.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Logger } from './logger.entity';
import { LoggerRepository } from './logger.repository';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forFeature([Logger], 'mysqlConnection') 
  ],
  providers: [LoggerServices,LoggerRepository],
  exports:[LoggerServices,LoggerRepository]
})
export class LoggerModule {}
