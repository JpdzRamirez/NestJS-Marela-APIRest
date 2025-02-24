import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { UserRepository } from '../users/users.repository';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthRequest } from '../../types';
import { UtilityService } from '../../shared/utility/utility.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository, 
    private readonly utilityService: UtilityService
  ) {}

  /** ✅ Obtener todos los usuarios */
  async getAllUsers(): Promise<User[]> {
    const users = await this.userRepository.getAllUsers();
    if (!users.length) {
      throw new HttpException(
        'No se encontraron usuarios',
        HttpStatus.NOT_FOUND,
      );
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
  async createUser(createUserDto: CreateUserDto): Promise<User | null> {
    const { email } = createUserDto;

    // Verificar si el email ya está registrado
    const existingUser = await this.userRepository.findByEmail(email);

    if (existingUser) {
      throw new HttpException(
        'El email ya está registrado',
        HttpStatus.BAD_REQUEST,
      );
    }

    const newUser = this.userRepository.createUser(createUserDto);

    return newUser;
  }

  /** ✅ Actualizar usuario por id (Solo Admin)*/
  async updateUserById(
    id: number,
    updateUserDto: UpdateUserDto
  ): Promise<boolean> {
    const user = await this.userRepository.getUserById(id);
    if (!user || !user.id) {
      throw new HttpException(
        'No se encontraron usuarios',
        HttpStatus.NOT_FOUND,
      );
    } 
    // Definir los campos permitidos para evitar actualizaciones no deseadas
    const allowedFields = [
      'name',
      'lastname',            
      'email',
      'document',
      'role_id',
      'password',
      'address',
      'mobile',
      'phone',
    ];
    const filteredData = Object.fromEntries(
      Object.entries(updateUserDto).filter(([key]) =>
        allowedFields.includes(key),
      ),
    );

    const updatedUser = { ...user, ...filteredData, id: user.id };

    return await this.userRepository.updateUser(id, updatedUser);
  }

  /** ✅ Actualizar mi usuario*/
  async updateMyUser(
    id: number,
    updateUserDto: UpdateUserDto,
    AuthRequest: AuthRequest,
  ): Promise<boolean> {
    const user = AuthRequest.user;
    if (!user || !user.id) {
      throw new HttpException('No se encontraro usuario', HttpStatus.NOT_FOUND);
    } else if (user.id != id) {
      throw new HttpException('Acceso denegado', HttpStatus.FORBIDDEN);
    }
    // Definir los campos permitidos para evitar actualizaciones no deseadas
    const allowedFields = [
      'name',
      'lastname',            
      'email',
      'document',
      'role_id',
      'password',
      'address',
      'mobile',
      'phone',
    ];
    const filteredData = Object.fromEntries(
      Object.entries(updateUserDto).filter(([key]) =>
        allowedFields.includes(key),
      ),
    );
    const updatedUser = { ...user, ...filteredData, id: user.id };
    return await this.userRepository.updateUser(id, updatedUser);
  }
  /** ✅ Generar token de autorización (Solo Admin)*/
  async createAuthCode(
    id: number
  ): Promise<boolean> {
    const user = await this.userRepository.getUserById(id);
    if (!user || !user.id) {
      throw new HttpException(
        'No se encontraron usuarios',
        HttpStatus.NOT_FOUND,
      );
    } 
    // Definir los campos permitidos para evitar actualizaciones no deseadas
    let code = this.utilityService.generateAuthCode();
    const updatedUser = { ...user, auth_code: code };

    return await this.userRepository.updateUser(id, updatedUser);
  }

  /** ✅ Eliminar usuario */
  async deleteUser(id: number, AuthRequest: AuthRequest): Promise<boolean> {
    // Lanza error si no cuenta con autorización
    if (AuthRequest.user && AuthRequest.user.roles?.id != 1) {
      throw new HttpException('Acceso denegado', HttpStatus.FORBIDDEN);
    }
    const user = await this.userRepository.getUserById(id);
    // Lanza error si no existe
    if (!user || !user.id) {
      throw new HttpException(
        'No se encontraron usuarios',
        HttpStatus.NOT_FOUND,
      );
    }
    return await this.userRepository.deleteUser(id, user);
  }
}
