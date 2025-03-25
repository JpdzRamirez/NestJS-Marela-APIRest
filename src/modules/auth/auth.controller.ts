import { 
  Controller, 
  Post, 
  Body, 
  Req, 
  UnauthorizedException, 
  HttpStatus, 
  UsePipes, 
  ValidationPipe, 
  Get,
  HttpCode,
  HttpException
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from '../users/user.entity';
import { Request } from 'express';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { LoggerServices } from '../logger/logger.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly logger: LoggerServices,
  ) {}

  @Get('public')
  async public() {
    try {
      return { message: 'Conexión con la api', status: true};
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }

  @Post('register')
  @HttpCode(201)
  @UsePipes(new ValidationPipe({ whitelist: true })) // 🔹 Aplica validación automática
  async register(@Body() createUserDto: CreateUserDto) {
    try {
      const user = await this.authService.userBuilder(createUserDto);
      return { message: 'Usuario registrado con éxito', user };
    } catch (error) {
      const status = error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
      const message = error.message || 'Error interno';

      this.logger.error(
        `Error en AuthController.login - Status: ${status} - Mensaje: ${message}`,
        error.stack,
      );
      
      throw new HttpException(message, status);
    }
  }

  @Post('login')
  @HttpCode(200)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async login(@Body() loginDto: LoginUserDto) {
    try {
      const result = await this.authService.login(loginDto);
      return { message: 'Login exitoso', ...result };
    }catch (error) {
      const status = error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
      const message = error.message || 'Error interno';

      this.logger.error(
        `Error en AuthController.login - Status: ${status} - Mensaje: ${message}`,
        error.stack,
      );

      throw new HttpException(message, status);
    }
  }

  @Post('logout')
  @HttpCode(204)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async logout(@Req() req: Request) {
    try {
      const authHeader = req.header('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {        
        throw new HttpException('Datos inválidos o faltantes', HttpStatus.BAD_REQUEST);
      }

      const token = authHeader.split(' ')[1];

      await this.authService.logout(token);

      return { message: 'Sesión cerrada correctamente' };

    } catch (error) {

      const status = error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
      const message = error.message || 'Error interno';

      this.logger.error(
        `Error en AuthController.login - Status: ${status} - Mensaje: ${message}`,
        error.stack,
      );

      throw new HttpException(message, status);
    }
  }
}
