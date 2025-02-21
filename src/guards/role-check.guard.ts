import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly requiredRoles: number[]) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Acceso no autorizado');
    }

    const roleId = user.roles?.id ?? NaN; // Si es undefined/null, asignamos NaN

    if (isNaN(roleId) || !this.requiredRoles.includes(roleId)) {
      throw new ForbiddenException('Sin permisos de usuario');
    }

    return true;
  }
}
