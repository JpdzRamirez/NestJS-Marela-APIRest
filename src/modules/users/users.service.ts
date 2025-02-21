import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { UserRepository } from '../users/users.repository';
import { User } from './User.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  /** ✅ Obtener todos los usuarios */
  async getAllUsers(): Promise<User[]> {
    const users = await this.userRepository.getAllUsers();
    if (!users.length) {
      throw new HttpException('No se encontraron usuarios', HttpStatus.NOT_FOUND);
    }
    return users;
  }

  /** ✅ Obtener usuario por ID */
  async getUserById(id: number): Promise<User> {
    const user = await this.userRepository.getUserById(id);
    if (!user) {
      throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
    }
    return user;
  }

  /** ✅ Obtener usuario por email */
  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findByEmail(email);
  }

  /** ✅ Crear un usuario */
  async createUser(createUserDto: CreateUserDto): Promise<User | null>  {
    const { email } = createUserDto;

    // Verificar si el email ya está registrado
    const existingUser = await this.userRepository.findByEmail(email);

    if (existingUser) {
      throw new HttpException('El email ya está registrado', HttpStatus.BAD_REQUEST);
    }

    const newUser = this.userRepository.createUser(createUserDto);
    
    return newUser;
  }

  /** ✅ Actualizar usuario */
  async updateUser(id: number, updateUserDto: UpdateUserDto): Promise<User | null> {
    try{
      const user = await this.getUserById(id); // Lanza error si no existe

      // Definir los campos permitidos para evitar actualizaciones no deseadas
      const allowedFields = ['email', 'document', 'role', 'password', 'address', 'mobile', 'phone'];
      const filteredData = Object.fromEntries(
        Object.entries(updateUserDto).filter(([key]) => allowedFields.includes(key))
      );
  
      Object.assign(user, filteredData);
      return await this.userRepository.updateUser(id,user);
    }catch(error){
      throw error;
    }

  }

  /** ✅ Eliminar usuario */
  async deleteUser(id: number): Promise<boolean> {
    try{
       // Lanza error si no existe
      const user = await this.getUserById(id);
      if(!user){
        throw new HttpException('No se encontraron usuarios', HttpStatus.NOT_FOUND);
      }
      await this.userRepository.deleteUser(id);
      return true;
    }catch(error){
      throw error;
    }

  }
}
