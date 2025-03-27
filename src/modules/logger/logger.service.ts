import { Injectable, LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthRequest } from '../../types';
import { LoggerRepository } from './logger.repository';
import { UAParser } from 'ua-parser-js';
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

  async log(log: any, request?: AuthRequest) {
    this.logger.error(`${log.stack}`);
    // 📌 Obtener el tipo de error dinámicamente
  const errorType = log?.constructor?.name ?? 'UnknownError';

  // 📌 Asegurar que el método HTTP se registre correctamente
  const method = request?.method?.toUpperCase() ?? 'UNKNOWN';
    await this.loggerRepository.saveLog({
      status_code: '200',
      error_type: errorType,
      method: method,
      url: request?.url ?? undefined,
      status_message: log.stack,
      uploaded_by_authsupa: request?.user?.uuid_authsupa ? request?.user?.uuid_authsupa : undefined,
    });
  }

  async error(error: any, trace?: string, request?: AuthRequest, statusCode?: number) {
    this.logger.error(`${error.stack} \nStack: ${trace}`);
      // 📌 Obtener el tipo de error dinámicamente
    const errorType = error?.constructor?.name ?? 'UnknownError';

    const userAgent = request?.headers['user-agent'] ?? '';

     // 📌 Extraer versión de la app y Flutter el User-Agent  
    const userAgentParts = userAgent.match(/App\/([\d.]+)\+(\d+) \(Flutter ([\d.]+); (Android) ([\d.]+); (.+?); (.+?)\)/);
    const appVersion = userAgentParts?.[1] || 'Unknown App Version';
    const buildNumber = userAgentParts?.[2] || 'Unknown Build';
    const flutterVersion = userAgentParts?.[3] || 'Unknown Flutter Version';
    const operatingSystem = userAgentParts?.[4] || 'Unknown OS';
    const androidVersion = userAgentParts?.[5] || 'Unknown Android Version';
    const extractedDeviceModel = userAgentParts?.[6] || 'Unknown DeviceModel';
    // 📌 Asegurar que el método HTTP se registre correctamente
    const method = request?.method?.toUpperCase() ?? 'UNKNOWN';

    await this.loggerRepository.saveLog({
      status_code: statusCode?.toString() ?? '500',
      error_type: errorType,
      method: method,
      url: request?.url ?? undefined,
      status_message: trace,
      address_ipv4: request?.ip,
      device_model:extractedDeviceModel,
      operating_system:operatingSystem,
      android_version: androidVersion,
      app_version: appVersion, // 📌 Versión de la app extraída
      build_number: buildNumber, // 📌 Número de compilación extraído
      flutter_version: flutterVersion, 
      uploaded_by_authsupa: request?.user?.uuid_authsupa ? request?.user?.uuid_authsupa : undefined,
    });
  }

  async warn(warn: any, request?: AuthRequest) {

    this.logger.error(`${warn.stack}`);
      // 📌 Obtener el tipo de error dinámicamente
    const errorType = warn?.constructor?.name ?? 'UnknownError';

    // 📌 Asegurar que el método HTTP se registre correctamente
    const method = request?.method?.toUpperCase() ?? 'UNKNOWN';

    await this.loggerRepository.saveLog({
      status_code: '300',
      error_type: errorType,
      method: method,
      url: request?.url ?? undefined,
      status_message: warn.stack,
      uploaded_by_authsupa: request?.user?.uuid_authsupa ? request?.user?.uuid_authsupa : undefined,
    });
  }

}
