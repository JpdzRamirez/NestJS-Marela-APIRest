import { Injectable, CanActivate, ExecutionContext,UnauthorizedException  } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SupabaseService } from '../config/supabase.service';
import { UsersService } from '../modules/users/users.service';
import { User } from '../modules/users/User.entity';
import { AuthRequest } from '../types';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly supabaseService: SupabaseService, private reflector: Reflector,private readonly usersService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthRequest>();

    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Acceso denegado. Token no proporcionado o formato incorrecto.');
    }
    const token = authHeader.split(' ')[1];
    
    try {
      const { data: authData, error: authError } = await this.supabaseService.getAdminClient().auth.getUser(token);

      if (authError || !authData.user || !authData.user.email) {
        throw new Error("Usuario no autenticado o token inválido");
      }     

      const complementaryDataUser = await this.usersService.findByEmail(authData.user.email);
      
      if (!complementaryDataUser) {
        throw new UnauthorizedException('Acceso denegado. Usuario no registrado.');
      }
          // 🔹 3. Mapear los datos al modelo `APPUser`
      const user: User = {
            id: complementaryDataUser.id,
            uuid_authsupa: complementaryDataUser.uuid_authsupa,
            schema_id: complementaryDataUser.schema_id,
            document: complementaryDataUser.document,
            email: complementaryDataUser.email,
            password: "", // 🔹 No devolver la contraseña por seguridad
            name: complementaryDataUser.name,
            lastname: complementaryDataUser.lastname,
            phone: complementaryDataUser.phone,
            mobile: complementaryDataUser.mobile,
            address: complementaryDataUser.address,
            created_at: complementaryDataUser.created_at,
            updated_at: complementaryDataUser.updated_at,
            roles: complementaryDataUser.roles ? { id: complementaryDataUser.roles.id, name: complementaryDataUser.roles.name } : null,
      };

      request.user = user; // Guarda la información del usuario en la request
      return true;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Acceso denegado. Token expirado.');
      } else if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Acceso denegado. Token no válido.');
      } else {
        throw new UnauthorizedException('Acceso denegado. Error al verificar el token.');
      }
    }
  }
}
