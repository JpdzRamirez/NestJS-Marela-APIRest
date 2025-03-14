import { Type } from 'class-transformer';
import { IsArray, ValidateNested, IsNotEmpty, IsString, Matches, IsInt,IsOptional, IsUUID  } from 'class-validator';

export class TrailDto {
  @IsNotEmpty({ message: 'El id es obligatorio' })
  @IsInt({ message: 'El id debe ser entero' })
  id!: number;

  @IsNotEmpty({ message: 'El id_ruta no puede estar vacío' })
  @IsUUID() 
  id_medidor!: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @Matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, { message: 'El nombre solo debe contener letras y espacios' })
  nombre!: string;

  @IsString()
  @IsOptional() 
  source_failure?: string;
}
export class TrailArrayDto {
  @IsArray({ message: 'El cuerpo debe ser un array de rutas' })
  @ValidateNested({ each: true })
  @Type(() => TrailDto)
  @IsNotEmpty({ message: 'El array de rutas no puede estar vacío' })
  type_clients!: TrailDto[];
}