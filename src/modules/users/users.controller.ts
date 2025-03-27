import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
  HttpException,
  SetMetadata,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { UserServices } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthRequest } from '../../types';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/role-check.guard';
import { Request } from 'express';
import { LoggerServices } from '../logger/logger.service';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserServices,
    private readonly logger: LoggerServices,
  ) {}

  /** ✅ Obtener todos los usuarios (Solo admin) */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetMetadata('roles', [1]) 
  @HttpCode(200)
  @Get('admin/get-users')
  async getAllUsers(@Req() request: Request) {
    try {
    const users = await this.userService.getAllUsers();
        if (!users.length) {
          throw new HttpException('No se encontraron usuarios', HttpStatus.NOT_FOUND);
        }
    return users;
    } catch (error) {
      const status = error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
      const response = error instanceof HttpException ? error.getResponse() : { message: 'Error interno', status: false };
      const errorMessage = typeof response === 'object' && 'message' in response ? response.message : 'Error desconocido';

      // 🔹 Capturar detalles de la petición
      const { url, method, ip } = request;

      this.logger.error(
        error,
        `Error en login - Status: ${status} - Método: ${method} - URL: ${url} - IP: ${ip}- Mensaje: ${errorMessage}`,        
        request,
        status,
      );
      throw new HttpException(response, status);
    }
  }

  /** ✅ Obtener perfil por ID */
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @Get('admin/get-profile/:id')
  async getProfile(@Param('id') id: number, @Req() request: AuthRequest) {
    try {
    if (isNaN(id)) {
      throw new HttpException('ID inválido', HttpStatus.BAD_REQUEST);
    }

    const roleId = Number(request.user?.roles?.id);
    const userId = Number(request.user?.id);

    if (roleId !== 1 && userId !== id) {
      throw new HttpException('Usuario no autorizado', HttpStatus.FORBIDDEN);
    }

    const user = await this.userService.getUserById(id);
    if (!user) {
      throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
    }

    return user;
  } catch (error) {
    const status = error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const response = error instanceof HttpException ? error.getResponse() : { message: 'Error interno', status: false };
    const errorMessage = typeof response === 'object' && 'message' in response ? response.message : 'Error desconocido';

    // 🔹 Capturar detalles de la petición
    const { url, method, ip } = request;

    this.logger.error(
      error,
      `Error en register - Status: ${status} - Método: ${method} - URL: ${url} - IP: ${ip}- Mensaje: ${errorMessage}`,        
      request,
      status,
    );
    throw new HttpException(response, status);
  }
  }

  /** ✅ Crear un nuevo usuario (Solo admin) */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetMetadata('roles', [1]) 
  @HttpCode(201)
  @Post('admin/create-user')
  async createUser(@Body() createUserDto: CreateUserDto, @Req() request: Request) {
  try {
    return await this.userService.createUser(createUserDto);
  } catch (error) {
    const status = error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const response = error instanceof HttpException ? error.getResponse() : { message: 'Error interno', status: false };
    const errorMessage = typeof response === 'object' && 'message' in response ? response.message : 'Error desconocido';

    // 🔹 Capturar detalles de la petición
    const { url, method, ip } = request;

    this.logger.error(
      error,
      `Error en register - Status: ${status} - Método: ${method} - URL: ${url} - IP: ${ip}- Mensaje: ${errorMessage}`,        
      request,
      status,
    );
    throw new HttpException(response, status);
  }   
  }

  /** ✅ Actualizar usuario por id (Solo admin) */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetMetadata('roles', [1]) 
  @HttpCode(201)
  @Patch('admin/update-user/:id')
  async updateUser(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto, @Req() request: Request) {
  try {
    return await this.userService.updateUserById(id, updateUserDto); 
  } catch (error) {
    const status = error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const response = error instanceof HttpException ? error.getResponse() : { message: 'Error interno', status: false };
    const errorMessage = typeof response === 'object' && 'message' in response ? response.message : 'Error desconocido';

    // 🔹 Capturar detalles de la petición
    const { url, method, ip } = request;

    this.logger.error(
      error,
      `Error en register - Status: ${status} - Método: ${method} - URL: ${url} - IP: ${ip}- Mensaje: ${errorMessage}`,        
      request,
      status,
    );
    throw new HttpException(response, status);
  }   
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetMetadata('roles', [1]) 
  @HttpCode(201)
  @Get('admin/create-auth-code/:id')
  async createAuthCode(@Param('id') id: number, @Req() request: Request) {
  try {
    const userCode=await this.userService.createAuthCode(id);
    if(!userCode){
      throw new HttpException('Error al actualizar usuario', HttpStatus.BAD_REQUEST);
    }
    return { message: `Codigo de autorización Generado`, status: userCode  };
  } catch (error) {
    const status = error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const response = error instanceof HttpException ? error.getResponse() : { message: 'Error interno', status: false };
    const errorMessage = typeof response === 'object' && 'message' in response ? response.message : 'Error desconocido';

    // 🔹 Capturar detalles de la petición
    const { url, method, ip } = request;

    this.logger.error(
      error,
      `Error en register - Status: ${status} - Método: ${method} - URL: ${url} - IP: ${ip}- Mensaje: ${errorMessage}`,        
      request,
      status,
    );
    throw new HttpException(response, status);
  }  
  }

  /** ✅ Eliminar usuario (Solo admin) */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetMetadata('roles', [1]) 
  @HttpCode(201)
  @Delete('admin/delete-user/:id')
  async deleteUser(@Param('id') id: number,@Req() request: AuthRequest) {
  try {
    const deleted = await this.userService.deleteUser(id,request);
    if (!deleted) {
      throw new HttpException('Error al eliminar usuario', HttpStatus.BAD_REQUEST);
    }
    return { message: `Usuario ${id} eliminado`, status: deleted };
  } catch (error) {
    const status = error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const response = error instanceof HttpException ? error.getResponse() : { message: 'Error interno', status: false };
    const errorMessage = typeof response === 'object' && 'message' in response ? response.message : 'Error desconocido';

    // 🔹 Capturar detalles de la petición
    const { url, method, ip } = request;

    this.logger.error(
      error,
      `Error en register - Status: ${status} - Método: ${method} - URL: ${url} - IP: ${ip}- Mensaje: ${errorMessage}`,        
      request,
      status,
    );
    throw new HttpException(response, status);
  }  
  }

  // 🟢 **Rutas para usuarios normales**
  /** ✅ Obtener perfil propio */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetMetadata('roles', [1,2,3]) 
  @HttpCode(200)
  @Get('profile/my-profile')
  async getMyProfile(@Req() request: AuthRequest) {
  try {
    if (!request.user) {
      throw new HttpException('Acceso denegado', HttpStatus.FORBIDDEN);
    }
    const id=request.user.id;
    return await this.userService.getUserById(id);

  } catch (error) {
    const status = error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const response = error instanceof HttpException ? error.getResponse() : { message: 'Error interno', status: false };
    const errorMessage = typeof response === 'object' && 'message' in response ? response.message : 'Error desconocido';

    // 🔹 Capturar detalles de la petición
    const { url, method, ip } = request;

    this.logger.error(
      error,
      `Error en register - Status: ${status} - Método: ${method} - URL: ${url} - IP: ${ip}- Mensaje: ${errorMessage}`,        
      request,
      status,
    );
    throw new HttpException(response, status);
  }  
  }

  /** ✅ Actualizar perfil propio */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetMetadata('roles', [1,2,3]) 
  @HttpCode(201)
  @Patch('profile/update-my-profile')
  async updateMyProfile(@Body() updateUserDto: UpdateUserDto, @Req() request: AuthRequest) {
  try {    
    if (!request.user) {
      throw new HttpException('Acceso denegado', HttpStatus.FORBIDDEN);
    }
    const id=request.user.id;
    const userUpdated= await this.userService.updateMyUser(id, updateUserDto,request);
    return { message: `Usuario ${id} Actualizado`, status: userUpdated };
    } catch (error) {
      const status = error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
      const response = error instanceof HttpException ? error.getResponse() : { message: 'Error interno', status: false };
      const errorMessage = typeof response === 'object' && 'message' in response ? response.message : 'Error desconocido';

      // 🔹 Capturar detalles de la petición
      const { url, method, ip } = request;

      this.logger.error(
        error,
        `Error en register - Status: ${status} - Método: ${method} - URL: ${url} - IP: ${ip}- Mensaje: ${errorMessage}`,        
        request,
        status,
      );
      throw new HttpException(response, status);
    }  
  }
}
