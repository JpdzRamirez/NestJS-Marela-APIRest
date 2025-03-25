import { Injectable,UnprocessableEntityException,HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupabaseService } from '../../config/supabase.service';
import { UtilityService } from '../../shared/utility/utility.service';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';


@Injectable()
export class UserRepository {
  constructor(
    private readonly supabaseService: SupabaseService, // ✅ Inyectamos el servicio de Supabase
    @InjectRepository(User) private readonly userRepository: Repository<User> ,
    private readonly utilityService: UtilityService
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
        throw new UnprocessableEntityException('No se pudo procesar la solicitud, revisa los datos');
      }

      // ✅ 2. Hashear contraseña antes de guardarla en PostgreSQL
      const passwordHashed = bcrypt.hashSync(user.password!, 10);

      if (!user.name || !user.lastname) {
        throw new HttpException('Datos inválidos o faltantes', HttpStatus.BAD_REQUEST);
      }
      const authCode= this.utilityService.generateAuthCode();

      const hashedAuthCode= this.utilityService.hashMD5(authCode);

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
        auth_code:hashedAuthCode
      });

      let savedUser = await queryRunner.manager.save(newUser);
      await queryRunner.commitTransaction();
      // devolvemos el codigo de autenticación para ser mostrado luego de registrar el usuario
      savedUser.auth_code=authCode;
      return savedUser;
    } catch (error) {
      await queryRunner.rollbackTransaction();      

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
  async updateUser(id: Number, updatedUser: Partial<User>,type: Number): Promise<{
    message: String;
    response: String;    
  }>{
    const queryRunner = this.userRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    /*
      Type 1= Actualización de perfiles desde administrador
      Type 2= Actualización de perfiles desde mi propio usuario
      Type 3= Actualización de código de autenticación
    */
    try {    
      let response='';
      // ✅ 1. Guardamos la contraseña
      const newpassword= updatedUser.password;
      // ✅ 2. Hasheamos la contraseña
      if (updatedUser.password) {
        updatedUser.password = bcrypt.hashSync(updatedUser.password, 10);
      } 
      if (updatedUser.auth_code && type===3){
        response=updatedUser.auth_code;
        updatedUser.auth_code = this.utilityService.hashMD5(response);
      }      
      // ✅ 3. Actualizar en public.users
      await queryRunner.manager.update(User, id, updatedUser);

      // ✅ 4. Actualizar en Supabase
      await this.supabaseService.getAdminClient().auth.admin.updateUserById(
        updatedUser.uuid_authsupa!,
        {
          email: updatedUser.email || updatedUser.email,
          password: newpassword || undefined,
          phone: updatedUser.phone || updatedUser.phone,
          user_metadata: {
            name: updatedUser.name || updatedUser.name,
            lastname: updatedUser.lastname || updatedUser.lastname,
          },
        }
      );

      await queryRunner.commitTransaction();

      if(type===1){
        response=`Usuario actualizado exitosamente`;
      }else if(type===2){
        response=`Mi usuario ha sido actualizado`;
      }else{
        response=`Codigo de autorización (Único): ${response}`;
      }

      return {
        message: "Operación exitosa, se han obtenido los siguientes resultados:",
        response: response        
      };;
      
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
  async deleteUser(id: number,user:User): Promise<boolean> {
    const queryRunner = this.userRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
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
