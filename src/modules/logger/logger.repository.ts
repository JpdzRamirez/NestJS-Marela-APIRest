import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Logger } from './logger.entity';

@Injectable()
export class LoggerRepository {
  constructor(
    @InjectRepository(Logger, 'mysqlConnection') // 🔹 Usa MySQL
    private readonly loggerRepository: Repository<Logger>,
  ) {}

  async saveLog(logData: Partial<Logger>) {
    const logEntry = this.loggerRepository.create(logData);
    return await this.loggerRepository.save(logEntry);
  }
}
