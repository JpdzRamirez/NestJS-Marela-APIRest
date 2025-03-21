import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber , IsString, Matches, IsArray, IsOptional, ValidateNested, IsInt, IsUUID } from 'class-validator';
export class SalesDto {

  @IsNotEmpty({ message: 'El id es obligatorio' })
  @IsInt({ message: 'El id debe ser entero' })
  id!: number;

  @IsNotEmpty({ message: 'El id_unidadmunicipal no puede estar vacío' })
  @IsUUID()
  id_tarifa!: string;
  
  @IsNotEmpty({ message: 'El UUID de la tipo servicio es obligatorio.' })
  @IsUUID()  
  tiposervicio_id!: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @Matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, { message: 'El nombre solo debe contener letras y espacios' })
  nombre!: string;

  @IsNotEmpty({ message: 'El rango final es obligatorio' })
  @IsNumber()
  rango_final!: number;

  @IsNotEmpty({ message: 'El rango inicial es obligatorio' })
  @IsNumber()
  rango_inicial!: number;


  @IsString()
  @IsOptional() 
  source_failure?: string;

}

export class SalesDtoArrayDto {
  @IsArray({ message: 'El cuerpo debe ser un array de tarifas' })
  @ValidateNested({ each: true })
  @Type(() => SalesDto)
  @IsNotEmpty({ message: 'El array de tarifas no puede estar vacío' })
  sales_rate!: SalesDto[];
}