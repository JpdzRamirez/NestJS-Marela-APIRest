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
  async register(@Body() createUserDto: CreateUserDto, @Req() request: Request) {
    try {
      const user = await this.authService.userBuilder(createUserDto);
      return { message: 'Usuario registrado con éxito', user };
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

  @Post('login')
  @HttpCode(200)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async login(@Body() loginDto: LoginUserDto, @Req() request: Request) {
    try {
      const result = await this.authService.login(loginDto);
      return { message: 'Login exitoso', ...result };
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

  @Post('logout')
  @HttpCode(204)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async logout(@Req() req: Request, @Req() request: Request) {
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
      const response = error instanceof HttpException ? error.getResponse() : { message: 'Error interno', status: false };
      const errorMessage = typeof response === 'object' && 'message' in response ? response.message : 'Error desconocido';

      // 🔹 Capturar detalles de la petición
      const { url, method, ip } = request;

      this.logger.error(
        error,
        `Error en logout - Status: ${status} - Método: ${method} - URL: ${url} - IP: ${ip}- Mensaje: ${errorMessage}`,
        request,
        status,
      );
      throw new HttpException(response, status);
    }
  }
}
