import { Injectable, LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthRequest } from '../../types';
import { LoggerRepository } from './logger.repository';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

@Injectable()
export class LoggerServices implements LoggerService {
  private logger: winston.Logger;

  constructor(
    private configService: ConfigService,
    private readonly loggerRepository: LoggerRepository,
  ) {
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

  async log(message: string, request?: AuthRequest) {
    this.logger.info(message);
    await this.loggerRepository.saveLog({
      status_code: '200',
      error_type: 'INFO',
      method: request?.method ? this.mapHttpMethod(request.method) : undefined,
      url: request?.url ?? undefined,
      status_message: message,
      uploaded_by_authsupa: request?.user?.uuid_authsupa ? request?.user?.uuid_authsupa : undefined,
    });
  }

  async error(message: string, trace?: string, request?: AuthRequest, statusCode?: number) {
    this.logger.error(`${message} \nStack: ${trace}`);
    await this.loggerRepository.saveLog({
      status_code: statusCode?.toString() ?? '500',
      error_type: 'ERROR',
      method: request?.method ? this.mapHttpMethod(request.method) : undefined,
      url: request?.url ?? undefined,
      status_message: message,
      uploaded_by_authsupa: request?.user?.uuid_authsupa ? request?.user?.uuid_authsupa : undefined,
    });
  }

  async warn(message: string, request?: AuthRequest) {
    this.logger.warn(message);
    await this.loggerRepository.saveLog({
      status_code: '300',
      error_type: 'WARNING',
      method: request?.method ? this.mapHttpMethod(request.method) : undefined,
      url: request?.url ?? undefined,
      status_message: message,
      uploaded_by_authsupa: request?.user?.uuid_authsupa ? request?.user?.uuid_authsupa : undefined,
    });
  }

  private mapHttpMethod(method: string): number {
    const methods = { GET: 1, POST: 2, PUT: 3, PATCH: 4, DELETE: 5 };
    return methods[method] ?? 0;
  }
}
