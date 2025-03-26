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
    UsePipes,
    ValidationPipe
  } from '@nestjs/common';
import { ProductsActivityService } from './products_activity.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/role-check.guard';
import { ProductsActivityArrayDto } from './dto/products_activity.dto';
import { AuthRequest } from '../../types';
import { LoggerServices } from '../logger/logger.service';
@Controller('products-activity')
export class ProductsActivityController {

constructor(
  private readonly productsActivityServices: ProductsActivityService,
  private readonly logger: LoggerServices,
) {}

  /** ✅ Subir todos los productos de las actividades no sincronizados desde el móbil (fontanero y admin) */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetMetadata('roles', [1,3])
  @HttpCode(201)
  @UsePipes(new ValidationPipe({ whitelist: true })) 
  @Post('admin/post-all-productsActivity')
    async submitAllProductsActivity(@Req() request: AuthRequest,@Body() productsActivityArray: ProductsActivityArrayDto) {    
    try { 
      return await this.productsActivityServices.submitAllProductsActivity(request, productsActivityArray.products_activity);
    } catch (error) {
      const status = error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
      const response = error instanceof HttpException ? error.getResponse() : { message: 'Error interno', status: false };
      const errorMessage = typeof response === 'object' && 'message' in response ? response.message : 'Error desconocido';

      this.logger.error(
        `Error en ProductsActivityController.submitAllProductsActivity - Status: ${status} - Mensaje: ${errorMessage}`,
        error.stack,
        request,
        status,
      );
      throw new HttpException(response, status);
    }
  }

    /** ✅ Obtener todos los productos de actividades no sincronizados desde el la base de datos (fontanero y admin) */
    @UseGuards(JwtAuthGuard, RolesGuard)
    @SetMetadata('roles', [1,3])
    @HttpCode(200)
    @UsePipes(new ValidationPipe({ whitelist: true }))
    @Get('admin/get-all-productsActivity')
      async getAllProductsActivity(@Req() request: AuthRequest ) { 
      try {    
        return await this.productsActivityServices.getAllProductsActivity(request);
      } catch (error) {
        const status = error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
        const response = error instanceof HttpException ? error.getResponse() : { message: 'Error interno', status: false };
        const errorMessage = typeof response === 'object' && 'message' in response ? response.message : 'Error desconocido';
  
        this.logger.error(
          `Error en ProductsActivityController.submitAllProductsActivity - Status: ${status} - Mensaje: ${errorMessage}`,
          error.stack,
          request,
          status,
        );
        throw new HttpException(response, status);
      }
    }


        /** ✅ Cudades sincronizados en móbil (fontanero y admin) */
      @UseGuards(JwtAuthGuard, RolesGuard)
      @SetMetadata('roles', [1,3])
      @HttpCode(201)
      @UsePipes(new ValidationPipe({ whitelist: true }))
      @Patch('admin/patch-sync-productsActivity')
        async syncProductsActivity(@Req() request: AuthRequest,@Body() productsActivityArray: ProductsActivityArrayDto ) {    
        try {  
          return await this.productsActivityServices.syncProductsActivity(request,productsActivityArray.products_activity);
        } catch (error) {
          const status = error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
          const response = error instanceof HttpException ? error.getResponse() : { message: 'Error interno', status: false };
          const errorMessage = typeof response === 'object' && 'message' in response ? response.message : 'Error desconocido';
    
          this.logger.error(
            `Error en ProductsActivityController.submitAllProductsActivity - Status: ${status} - Mensaje: ${errorMessage}`,
            error.stack,
            request,
            status,
          );
    
          throw new HttpException(response, status);
        }
      }

}
