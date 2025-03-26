import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { LoggerServices } from '../modules/logger/logger.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly requiredRoles: number[],
    private readonly logger: LoggerServices,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    try {
      const user = request.user;

      if (!user) {
        throw new ForbiddenException('Acceso no autorizado');
      }

      const roleId = user.roles?.id ?? NaN; // Si es undefined/null, asignamos NaN

      if (isNaN(roleId) || !this.requiredRoles.includes(roleId)) {
        throw new ForbiddenException('Sin permisos de usuario');
      }

      return true;
    } catch (error) {
      const status =
        error instanceof HttpException
          ? error.getStatus()
          : HttpStatus.UNAUTHORIZED; // 🔹 Si no es una excepción de Nest, asumimos 401

      const response =
        error instanceof HttpException
          ? error.getResponse()
          : { message: 'Acceso denegado', status: false };

      const errorMessage =
        typeof response === 'object' && 'message' in response
          ? response.message
          : 'Error desconocido';

      // 🔹 Capturar detalles de la petición
      const url = request.url;
      const method = request.method;

      // 🔹 Registrar el error en el logger antes de lanzar la excepción
      this.logger.error(
        `Error en RolesGuard - Status: ${status} - Método: ${method} - URL: ${url} - Mensaje: ${errorMessage}`,
        error.stack,
      );

      // 🔹 Lanzar la excepción con el código HTTP correcto
      throw new HttpException(response, status);
    }
  }
}
