import { 
  Controller, 
  Post, 
  Body, 
  Req, 
  UnauthorizedException, 
  HttpStatus, 
  UsePipes, 
  ValidationPipe, 
  Get
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from '../users/user.entity';
import { Request } from 'express';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('public')
  async public() {
    try {
      return { message: 'Conexión con la api', status: true};
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }

  @Post('register')
  @UsePipes(new ValidationPipe({ whitelist: true })) // 🔹 Aplica validación automática
  async register(@Body() createUserDto: CreateUserDto) {
    try {
      const user = await this.authService.userBuilder(createUserDto);
      if (!user) {
        throw new UnauthorizedException('No se pudo crear el usuario');
      }
      return { message: 'Usuario registrado con éxito', user };
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }

  @Post('login')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async login(@Body() loginDto: LoginUserDto) {
    try {
      const result = await this.authService.login(loginDto);
      if (!result) {
        throw new UnauthorizedException('Credenciales inválidas');
      }
      return { message: 'Login exitoso', ...result };
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }

  @Post('logout')
  async logout(@Req() req: Request) {
    try {
      const authHeader = req.header('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedException('Token no proporcionado');
      }

      const token = authHeader.split(' ')[1];
      const result = await this.authService.logout(token);

      if (!result) {
        throw new UnauthorizedException('Error al cerrar sesión');
      }

      return { message: 'Sesión cerrada correctamente' };
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }
}
