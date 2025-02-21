import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SupabaseService } from '../../config/supabase.service';
import { UserRepository } from '../users/users.repository';
import { LoginData } from '../../types';
import { User } from '../users/User.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly supabaseService: SupabaseService, // ✅ Inyectamos SupabaseService
    private readonly userRepository: UserRepository,  // ✅ Inyectamos el UserRepository
  ) {}

  async userBuilder(data: Partial<User>): Promise<any> {
    try {
      return await this.userRepository.createUser(data);
    } catch (error) {
      throw error;
    }
  }

  async logout(token: string): Promise<boolean> {
    try {
      const { error } = await this.supabaseService.getAdminClient().auth.admin.signOut(token);
      if (error) {
        throw new Error(error.message);
      }
      return true;
    } catch (error) {
      console.error('❌ Error interno en logout:', error);
      return false;
    }
  }

  async login(data: LoginData): Promise<{ token: string; user: User } | null> {
    try {
      // 🔹 Autenticación con Supabase
      const { data: authData, error } = await this.supabaseService.getAdminClient().auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        throw new UnauthorizedException(error.message);
      }

      const token = authData.session?.access_token;
      if (!token) {
        throw new UnauthorizedException('Error al generar token de sesión');
      }

      // 🔹 Cerrar sesiones anteriores del usuario autenticado
      await this.supabaseService.getAdminClient().auth.signOut({ scope: 'others' });

      // 🔹 Buscar datos complementarios en PostgreSQL
      const complementaryDataUser = await this.userRepository.findByEmail(authData.user.email as string);
      if (!complementaryDataUser) {
        throw new UnauthorizedException('Usuario no encontrado en la base de datos');
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
    } catch (error) {
      throw error;
    }
  }
}
