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
    SetMetadata,
    HttpException,
    HttpStatus,
    HttpCode,
    UsePipes,
    ValidationPipe
  } from '@nestjs/common';
import { BrandsService } from './brands.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/role-check.guard';
import { BrandsArrayDto } from './dto/brand.dto';
import { AuthRequest } from '../../types';
import { LoggerServices } from '../logger/logger.service';

@Controller('brands')
export class BrandsController {

constructor(
  private readonly brandsServices: BrandsService,
  private readonly logger: LoggerServices,
) {}

  /** ✅ Subir todos las marcas no sincronizados desde el móbil (fontanero y admin) */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetMetadata('roles', [1,3]) 
  @HttpCode(201)
  @UsePipes(new ValidationPipe({ whitelist: true })) 
  @Post('admin/post-all-brands')
    async submitAllBrands(@Req() request: AuthRequest,@Body() brandsArray: BrandsArrayDto) {    
    try {  
      return await this.brandsServices.submitAllBrands(request, brandsArray.cities);
    } catch (error) {
      const status = error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
      const response = error instanceof HttpException ? error.getResponse() : { message: 'Error interno', status: false };
      const errorMessage = typeof response === 'object' && 'message' in response ? response.message : 'Error desconocido';

      // 🔹 Capturar detalles de la petición
      const { url, method, ip } = request;

      this.logger.error(        
        error,
        `Error en BrandsController.submitAllBrands - Status: ${status} - Método: ${method} - URL: ${url} - IP: ${ip}- Mensaje: ${errorMessage}`,
        request,
        status,
      );
      throw new HttpException(response, status);
    }
  }

  /** ✅ Obtener todos las marcas no sincronizados desde el la base de datos (fontanero y admin) */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetMetadata('roles', [1,3]) 
  @HttpCode(200)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Get('admin/get-all-brands')
    async getAllBrands(@Req() request: AuthRequest ) {
    try {      
      return await this.brandsServices.getAllBrands(request);
    } catch (error) {
      const status = error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
      const response = error instanceof HttpException ? error.getResponse() : { message: 'Error interno', status: false };
      const errorMessage = typeof response === 'object' && 'message' in response ? response.message : 'Error desconocido';

      // 🔹 Capturar detalles de la petición
      const { url, method, ip } = request;

      this.logger.error(        
        error,
        `Error en BrandsController.getAllBrands - Status: ${status} - Método: ${method} - URL: ${url} - IP: ${ip}- Mensaje: ${errorMessage}`,
        request,
        status,
      );

      throw new HttpException(response, status);
    }
  }
  
    /** ✅ Marcas sincronizados en móbil (fontanero y admin) */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetMetadata('roles', [1,3]) 
  @HttpCode(201)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Patch('admin/patch-sync-brands')
    async syncBrands(@Req() request: AuthRequest,@Body() brandsArray: BrandsArrayDto ) {    
    try {   
      return await this.brandsServices.syncBrands(request,brandsArray.cities);
    } catch (error) {
      const status = error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
      const response = error instanceof HttpException ? error.getResponse() : { message: 'Error interno', status: false };
      const errorMessage = typeof response === 'object' && 'message' in response ? response.message : 'Error desconocido';

      // 🔹 Capturar detalles de la petición
      const { url, method, ip } = request;

      this.logger.error(        
        error,
        `Error en BrandsController.syncBrands - Status: ${status} - Método: ${method} - URL: ${url} - IP: ${ip}- Mensaje: ${errorMessage}`,
        request,
        status,
      );

      throw new HttpException(response, status);
    }
  }

}
