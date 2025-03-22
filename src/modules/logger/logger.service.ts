import { Injectable, LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

@Injectable()
export class LoggerServices implements LoggerService {
  private logger: winston.Logger;

  constructor(private configService: ConfigService) {
    const logPath = this.configService.get<string>('LOG_PATH') || 'logs';

    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(({ timestamp, level, message }) => {
          return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
        })
      ),
      transports: [
        new winston.transports.Console(), // Para imprimir en la terminal
        new winston.transports.DailyRotateFile({
          filename: `${logPath}/app-%DATE%.log`,
          datePattern: 'YYYY-MM-DD',
          maxSize: '10m',
          maxFiles: '30d',
          level: 'error', // Solo guarda errores en el archivo
        }),
      ],
    });
  }

  log(message: string) {
    this.logger.info(message);
  }

  error(message: string, trace?: string) {
    this.logger.error(`${message} \nStack: ${trace}`);
  }

  warn(message: string) {
    this.logger.warn(message);
  }
}
