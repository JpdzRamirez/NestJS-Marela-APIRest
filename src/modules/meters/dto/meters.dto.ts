import { Type } from 'class-transformer';
import { IsArray, ValidateNested, IsNotEmpty, IsString, Matches, IsInt,IsOptional, IsUUID  } from 'class-validator';

export class WaterMetersDto {
  @IsNotEmpty({ message: 'El id es obligatorio' })
  @IsInt({ message: 'El id debe ser entero' })
  id!: number;

  @IsNotEmpty({ message: 'El id_medidor no puede estar vacío' })
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
export class WaterMetersArrayDto {
  @IsArray({ message: 'El cuerpo debe ser un array de medidores' })
  @ValidateNested({ each: true })
  @Type(() => WaterMetersDto)
  @IsNotEmpty({ message: 'El array de medidores no puede estar vacío' })
  water_meters!: WaterMetersDto[];
}