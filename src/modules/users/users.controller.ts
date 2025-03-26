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

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserServices) {}

  /** ✅ Obtener todos los usuarios (Solo admin) */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetMetadata('roles', [1]) 
  @HttpCode(200)
  @Get('admin/get-users')
  async getAllUsers() {
    const users = await this.userService.getAllUsers();
    if (!users.length) {
      throw new HttpException('No se encontraron usuarios', HttpStatus.NOT_FOUND);
    }
    return users;
  }

  /** ✅ Obtener perfil por ID */
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @Get('admin/get-profile/:id')
  async getProfile(@Param('id') id: number, @Req() req: AuthRequest) {
    if (isNaN(id)) {
      throw new HttpException('ID inválido', HttpStatus.BAD_REQUEST);
    }

    const roleId = Number(req.user?.roles?.id);
    const userId = Number(req.user?.id);

    if (roleId !== 1 && userId !== id) {
      throw new HttpException('Usuario no autorizado', HttpStatus.FORBIDDEN);
    }

    const user = await this.userService.getUserById(id);
    if (!user) {
      throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
    }

    return user;
  }

  /** ✅ Crear un nuevo usuario (Solo admin) */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetMetadata('roles', [1]) 
  @HttpCode(201)
  @Post('admin/create-user')
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  /** ✅ Actualizar usuario por id (Solo admin) */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetMetadata('roles', [1]) 
  @HttpCode(201)
  @Patch('admin/update-user/:id')
  async updateUser(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto) {
    return  await this.userService.updateUserById(id, updateUserDto);    
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetMetadata('roles', [1]) 
  @HttpCode(201)
  @Get('admin/create-auth-code/:id')
  async createAuthCode(@Param('id') id: number) {
    const userCode=await this.userService.createAuthCode(id);
    if(!userCode){
      throw new HttpException('Error al actualizar usuario', HttpStatus.BAD_REQUEST);
    }
    return { message: `Codigo de autorización Generado`, status: userCode  };
  }

  /** ✅ Eliminar usuario (Solo admin) */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetMetadata('roles', [1]) 
  @HttpCode(201)
  @Delete('admin/delete-user/:id')
  async deleteUser(@Param('id') id: number,@Req() request: AuthRequest) {
    const deleted = await this.userService.deleteUser(id,request);
    if (!deleted) {
      throw new HttpException('Error al eliminar usuario', HttpStatus.BAD_REQUEST);
    }
    return { message: `Usuario ${id} eliminado`, status: deleted };
  }

  // 🟢 **Rutas para usuarios normales**
  /** ✅ Obtener perfil propio */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetMetadata('roles', [1,2,3]) 
  @HttpCode(200)
  @Get('profile/my-profile')
  async getMyProfile(@Req() request: AuthRequest) {
    if (!request.user) {
      throw new HttpException('Acceso denegado', HttpStatus.FORBIDDEN);
    }
    const id=request.user.id;
    return this.userService.getUserById(id);
  }

  /** ✅ Actualizar perfil propio */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetMetadata('roles', [1,2,3]) 
  @HttpCode(201)
  @Patch('profile/update-my-profile')
  async updateMyProfile(@Body() updateUserDto: UpdateUserDto, @Req() request: AuthRequest) {    
    if (!request.user) {
      throw new HttpException('Acceso denegado', HttpStatus.FORBIDDEN);
    }
    const id=request.user.id;
    const userUpdated= await this.userService.updateMyUser(id, updateUserDto,request);
    return { message: `Usuario ${id} Actualizado`, status: userUpdated };
  }
}
