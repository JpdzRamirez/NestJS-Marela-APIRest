import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';



@Injectable()
export class SupabaseService {
  private supabaseAdmin: SupabaseClient;
  private supabaseAnon: SupabaseClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseAnonKey = this.configService.get<string>('SUPABASE_ANON_KEY');
    const supabaseServiceRoleKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
      throw new Error('⚠️ Faltan variables de entorno de Supabase en .env');
    }

    this.supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
    this.supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);
  }

  getAdminClient(): SupabaseClient {
    return this.supabaseAdmin;
  }

  getAnonClient(): SupabaseClient {
    return this.supabaseAnon;
  }

  async createAuthUser(userData: { email: string; password: string; name?: string }) {
    const { data, error } = await this.supabaseAdmin.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true,
      user_metadata: {
        name: userData.name,
      },
    });

    if (error) {
      throw new Error(`Error al crear usuario en Supabase: ${error.message}`);
    }

    return data.user?.id;
  }

  async deleteAuthUser(userId: string) {
    const { error } = await this.supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) {
      throw new Error(`Error al eliminar usuario en Supabase: ${error.message}`);
    }
  }
}
