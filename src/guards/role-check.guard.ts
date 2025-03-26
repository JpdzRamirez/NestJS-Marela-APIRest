import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { LoggerServices } from '../modules/logger/logger.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector, // 🔹 Obtiene los roles desde los decoradores
    private readonly logger: LoggerServices, // 🔹 Logger inyectado correctamente
  ) {}

  canActivate(context: ExecutionContext): boolean {
    // 🔹 Obtiene los roles requeridos desde el decorador @SetMetadata()
    const requiredRoles = this.reflector.get<number[]>('roles', context.getHandler());

    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // 🔹 Si no hay roles definidos, permite el acceso
    }

    const request = context.switchToHttp().getRequest();
    try {
      const user = request.user;

      if (!user) {
        throw new ForbiddenException('Acceso no autorizado. Usuario no encontrado.');
      }

      const roleId = user.roles?.id ?? NaN; // Si es undefined/null, asignamos NaN

      if (isNaN(roleId) || !requiredRoles.includes(roleId)) {
        throw new ForbiddenException('Sin permisos de usuario');
      }

      return true;
    } catch (error) {
      const status =
        error instanceof HttpException
          ? error.getStatus()
          : HttpStatus.UNAUTHORIZED;

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
