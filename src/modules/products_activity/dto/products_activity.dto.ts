import { Type } from 'class-transformer';
import { IsNotEmpty, IsString,MaxLength,IsNumber, Matches, IsArray, IsOptional, ValidateNested, IsInt, IsUUID,IsBoolean } from 'class-validator';
export class ProductsActivityDto {

  @IsNotEmpty({ message: 'El id es obligatorio' })
  @IsInt({ message: 'El id debe ser entero' })
  id!: number;

  @IsNotEmpty({ message: 'El id_productosactividad no puede estar vacío' })
  @IsUUID()
  id_productosactividad!: string;

  @IsString()
  @MaxLength(50)
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @Matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, { message: 'El nombre solo debe contener letras y espacios' })
  nombre!: string;
  
  @IsNotEmpty({ message: 'El stock es obligatorio' })
  @IsInt()  
  stock!: number;

  @IsNotEmpty({ message: 'El codigo es obligatorio' })
  @IsInt()  
  codigo!: number;

  @IsNotEmpty({ message: 'El codigo es obligatorio' })
  @IsNumber({}, { message: 'El precio debe ser un número válido' })
  precio_venta!: number;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  descripcion!: string;

  @IsOptional()
  @IsBoolean()
  manejo_stock?: boolean;

  @IsOptional()
  @IsBoolean()
  producto_venta?: boolean;

  @IsNotEmpty({ message: 'La unidad_id no puede estar vacío' })
  @IsUUID() 
  unidad_id!: string;

  @IsNotEmpty({ message: 'La actividad_id no puede estar vacío' })
  @IsUUID() 
  actividad_id!: string;

  @IsString()
  @IsOptional() 
  source_failure?: string;

}

export class ProductsActivityArrayDto {
  @IsArray({ message: 'El cuerpo debe ser un array de productos' })
  @ValidateNested({ each: true })
  @Type(() => ProductsActivityDto)
  @IsNotEmpty({ message: 'El array de productos no puede estar vacío' })
  products_activity!: ProductsActivityDto[];
}