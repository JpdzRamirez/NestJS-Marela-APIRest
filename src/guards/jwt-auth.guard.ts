import { 
  Injectable,
  CanActivate, 
  ExecutionContext,
  UnauthorizedException,
  HttpException,
  HttpStatus  } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SupabaseService } from '../config/supabase.service';
import { UserServices } from '../modules/users/users.service';
import { User } from '../modules/users/user.entity';
import { AuthRequest } from '../types';
import { LoggerServices } from '../modules/logger/logger.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly supabaseService: SupabaseService, private reflector: Reflector,
    private readonly userService: UserServices,
    private readonly logger: LoggerServices,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    
      const request = context.switchToHttp().getRequest<AuthRequest>();
      
      try {
      const authHeader = request.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedException('Acceso denegado. Token no proporcionado o formato incorrecto.');
      }
      const token = authHeader.split(' ')[1];    
 
      const { data: authData, error: authError } = await this.supabaseService.getAdminClient().auth.getUser(token);

      if (authError) {
        throw new UnauthorizedException(`Error en la autenticación: ${authError.message}`);
      }
      if (!authData.user || !authData.user.email) {
        throw new UnauthorizedException('Acceso denegado. Usuario no autenticado o token inválido.');
      }  

      const complementaryDataUser = await this.userService.findByEmail(authData.user.email);
      
      if (!complementaryDataUser) {
        throw new UnauthorizedException('Acceso denegado. Usuario no registrado.');
      }
      if(!complementaryDataUser.is_active){
        throw new UnauthorizedException('Acceso denegado. Usuario inactivado.');
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
            is_active: complementaryDataUser.is_active,
            auth_code: complementaryDataUser.auth_code,
            roles: complementaryDataUser.roles ? { id: complementaryDataUser.roles.id, name: complementaryDataUser.roles.name } : null,
            schemas: complementaryDataUser.schemas ? { id: complementaryDataUser.schemas.id, name: complementaryDataUser.schemas.name } : null,
      };

      request.user = user; // Guarda la información del usuario en la request
      return true;
    } catch (error) {
      const status = error instanceof HttpException ? error.getStatus(): HttpStatus.UNAUTHORIZED; // 🔹 Si no es una excepción de Nest, asumimos 401

      const response = error instanceof HttpException ? error.getResponse() : { message: 'Acceso denegado', status: false };

      const errorMessage = typeof response === 'object' && 'message' in response ? response.message : 'Error desconocido';

      // 🔹 Capturar detalles de la petición
      const { url, method, ip } = request;

      // 🔹 Registrar el error en el logger antes de lanzar la excepción
      this.logger.error(          
          error,
          `Error en JwtAuthGuard - Status: ${status} - Método: ${method} - URL: ${url} - IP: ${ip}- Mensaje: ${errorMessage}`,
          request,
          status
      );

        // 🔹 Lanzar la excepción con el código HTTP correcto
        throw new HttpException(response, status);
    }
  }
}
