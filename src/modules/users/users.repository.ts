import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupabaseService } from '../../config/supabase.service';
import { User } from '../users/User.entity';
import bcrypt from 'bcryptjs';

@Injectable()
export class UserRepository {
  constructor(
    private readonly supabaseService: SupabaseService, // ✅ Inyectamos el servicio de Supabase
    @InjectRepository(User) private readonly userRepository: Repository<User> // ✅ Inyectamos el repositorio de TypeORM
  ) {}

  /** ✅
   * Obtiene un usuario por su ID
   */
  async getUserById(id: number): Promise<User | null> {
    try {
      return await this.userRepository.findOne({
        where: { id },
        relations: ['roles'],
      });
    } catch (error) {
      console.error('❌ Error en getUserById:', error);
      throw error;
    }
  }

  /** ✅
   * Obtiene un usuario por su Email
   */
  async findByEmail(email: string): Promise<User | null> {
    try {
      return await this.userRepository.findOne({
        where: { email },
        relations: ['roles'],
      });
    } catch (error) {
      console.error('❌ Error en findByEmail:', error);
      throw error;
    }
  }

  /** ✅
   * Obtiene todos los usuarios
   */
  async getAllUsers(): Promise<User[]> {
    try {
      return await this.userRepository.find({ relations: ['roles'] });
    } catch (error) {
      console.error('❌ Error en getAllUsers:', error);
      throw error;
    }
  }

  /** ✅
   * Crea un nuevo usuario en PostgreSQL y Supabase Auth
   */
  async createUser(user: Partial<User>): Promise<any> {
    let authUserId: string | null = null;
    const queryRunner = this.userRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // ✅ 1. Crear usuario en Supabase Auth
      authUserId = await this.supabaseService.createAuthUser({
        email: user.email!,
        password: user.password!,
        name: user.name,
      });

      if (!authUserId) {
        throw new Error('No se pudo crear el usuario en Supabase.');
      }

      // ✅ 2. Hashear contraseña antes de guardarla en PostgreSQL
      const passwordHashed = bcrypt.hashSync(user.password!, 10);

      // ✅ 3. Crear usuario en la base de datos PostgreSQL
      const newUser = this.userRepository.create({
        uuid_authsupa: authUserId,
        email: user.email,
        name: user.name,
        lastname: user.lastname,
        password: passwordHashed,
        phone: user.phone,
        mobile: user.mobile,
        address: user.address,
      });

      const savedUser = await queryRunner.manager.save(newUser);
      await queryRunner.commitTransaction();
      return savedUser;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('❌ Error al crear usuario:', error);

      // Si falló, eliminar usuario en Supabase Auth
      if (authUserId) {
        await this.supabaseService.deleteAuthUser(authUserId);
      }

      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /** ✅
   * Actualiza un usuario por su ID en PostgreSQL y Supabase
   */
  async updateUser(id: number, user: Partial<User>): Promise<User | null> {
    const queryRunner = this.userRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      user.updated_at = new Date();

      // ✅ 1. Obtener usuario actual
      const existingUser = await this.userRepository.findOne({ where: { id } });
      if (!existingUser) throw new Error('Usuario no encontrado.');

      if (user.password) {
        user.password = bcrypt.hashSync(user.password, 10);
      }

      await queryRunner.manager.update(User, id, user);

      // ✅ 2. Actualizar en Supabase
      await this.supabaseService.getAdminClient().auth.admin.updateUserById(
        existingUser.uuid_authsupa!,
        {
          email: user.email || existingUser.email,
          password: user.password || undefined,
          phone: user.phone || existingUser.phone,
          user_metadata: {
            name: user.name || existingUser.name,
            lastname: user.lastname || existingUser.lastname,
          },
        }
      );

      await queryRunner.commitTransaction();

      return this.userRepository.findOne({ where: { id }, relations: ['roles'] });
      
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('❌ Error en updateUser:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /** ✅
   * Elimina un usuario en PostgreSQL y Supabase Auth
   */
  async deleteUser(id: number): Promise<boolean> {
    const queryRunner = this.userRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // ✅ 1. Obtener usuario antes de eliminarlo
      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) return false;

      // ✅ 2. Eliminar en PostgreSQL
      await queryRunner.manager.delete(User, id);

      // ✅ 3. Eliminar en Supabase
      await this.supabaseService.deleteAuthUser(user.uuid_authsupa!);

      await queryRunner.commitTransaction();
      return true;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('❌ Error en deleteUser:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
