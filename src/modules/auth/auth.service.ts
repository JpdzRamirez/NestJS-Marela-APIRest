import { Injectable, UnauthorizedException,HttpException, HttpStatus } from '@nestjs/common';
import { SupabaseService } from '../../config/supabase.service';
import { UserRepository } from '../users/users.repository';
import { UtilityService } from '../../shared/utility/utility.service';
import { LoginData } from '../../types';
import { User } from '../users/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly supabaseService: SupabaseService, // ✅ Inyectamos SupabaseService
    private readonly userRepository: UserRepository, // ✅ Inyectamos el UserRepository
    private readonly utilityService: UtilityService
  ) {}

  async userBuilder(data: Partial<User>): Promise<any> {
    try {
      
      if(!data || !data.email){
        throw new HttpException('Datos inválidos o faltantes', HttpStatus.BAD_REQUEST);
      }
      const isregistered= await this.userRepository.findByEmail(data.email);

      if(isregistered){
        throw new HttpException('El usuario ya existe en el sistema', HttpStatus.CONFLICT);
      }

      return await this.userRepository.createUser(data);

    } catch (error) {
      throw error;
    }
  }

  async logout(token: string): Promise<boolean> {
      const { error } = await this.supabaseService
        .getAdminClient()
        .auth.admin.signOut(token);
      if (error) {
        throw new HttpException(`Error al validar los datos enviados -> ${error.message}`, HttpStatus.UNPROCESSABLE_ENTITY);        
      }
      return true;
  }

  async login(data: LoginData): Promise<{ token: string; user: User } | null> {
      // 🔹 Buscar datos complementarios en PostgreSQL
      const complementaryDataUser = await this.userRepository.findByEmail(
        data.email as string,
      );
      // Validamos usuario existe antes de generar token
      if (!complementaryDataUser || !complementaryDataUser.auth_code) {
        throw new HttpException('Recurso no encontrado', HttpStatus.NOT_FOUND);
      } else if (!this.utilityService.verificarHash(data.auth_code,complementaryDataUser.auth_code)) {
        throw new HttpException('Usuario no autenticado', HttpStatus.UNAUTHORIZED);
      }
      // 🔹 Autenticación con Supabase
      const { data: authData, error } = await this.supabaseService
        .getAdminClient()
        .auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });

      if (error) {
        throw new HttpException('Recurso no encontrado', HttpStatus.NOT_FOUND);
      }
      // 🔹 Cerrar sesiones anteriores del usuario autenticado
      await this.supabaseService
        .getAdminClient()
        .auth.signOut({ scope: 'others' });

      const token = authData.session?.access_token;

      if (!token) {
        throw new HttpException('Datos inválidos o faltantes', HttpStatus.BAD_REQUEST);
      }

      return {
        token,
        user: {
          id: complementaryDataUser.id,
          uuid_authsupa: authData.user.id,
          schema_id: complementaryDataUser.schema_id,
          document: complementaryDataUser.document,
          email: authData.user.email || '',
          name: complementaryDataUser.name,
          lastname: complementaryDataUser.lastname,
          phone: complementaryDataUser.phone,
          address:complementaryDataUser.address,
          auth_code:complementaryDataUser.auth_code,
          mobile: complementaryDataUser.mobile,
          created_at: complementaryDataUser.created_at,
          updated_at: complementaryDataUser.updated_at,
          roles: complementaryDataUser.roles
            ? {
                id: complementaryDataUser.roles.id,
                name: complementaryDataUser.roles.name,
              }
            : null,
        },
      };
  }
}
