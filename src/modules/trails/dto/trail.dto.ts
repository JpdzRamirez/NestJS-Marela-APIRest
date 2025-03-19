import { Type } from 'class-transformer';
import { IsArray, ValidateNested, IsNotEmpty, IsString, Matches, IsInt,IsOptional, IsUUID,IsObject   } from 'class-validator';

export class TrailDto {
  @IsNotEmpty({ message: 'El id es obligatorio' })
  @IsInt({ message: 'El id debe ser entero' })
  id!: number;

  @IsNotEmpty({ message: 'El id_ruta no puede estar vacío' })
  @IsUUID() 
  id_ruta!: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @Matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, { message: 'El nombre solo debe contener letras y espacios' })
  nombre!: string;
  
  @IsArray()
  @IsNotEmpty({ message: 'El listado de rutas debe ser enviado en formato json' })
  @IsObject({ each: true }) // Valida que cada elemento del array sea un objeto
  unidades_municipales!: Record<string, any>[] | null;

  @IsString()
  @IsOptional() 
  source_failure?: string;
}
export class TrailArrayDto {
  @IsArray({ message: 'El cuerpo debe ser un array de rutas' })
  @ValidateNested({ each: true })
  @Type(() => TrailDto)
  @IsNotEmpty({ message: 'El array de rutas no puede estar vacío' })
  trails!: TrailDto[];
}