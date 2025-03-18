import { Type } from 'class-transformer';
import { IsArray, ValidateNested, IsNotEmpty, IsString, Matches, IsInt,IsOptional, IsUUID,Length  } from 'class-validator';

export class WaterMetersDto {
  @IsNotEmpty({ message: 'El id es obligatorio' })
  @IsInt({ message: 'El id debe ser entero' })
  id!: number;

  @IsNotEmpty({ message: 'El ID del medidor no puede estar vacío' })
  @IsUUID() 
  id_medidor!: string;

  @IsString({ message: 'El tipo debe ser una cadena de texto.' })
  @Type(() => String)
  numero_referencia: string;

  @IsOptional()
  @IsString({ message: 'El tipo debe ser una cadena de texto.' })
  @Length(1, 100, { message: 'El tipo debe tener entre 1 y 100 caracteres.' })
  tipo?: string;

  @IsOptional()
  @IsString({ message: 'El modelo debe ser una cadena de texto.' })
  @Length(1, 100, { message: 'El modelo debe tener entre 1 y 100 caracteres.' })
  modelo?: string;

  @IsOptional()
  @IsString({ message: 'El diámetro debe ser una cadena de texto.' })
  @Length(1, 100, { message: 'El diámetro debe tener entre 1 y 100 caracteres.' })
  diametro?: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto.' })
  @Length(1, 250, { message: 'La descripción debe tener entre 1 y 250 caracteres.' })
  descripcion?: string;

  @IsNotEmpty({ message: 'El ID del contrato es obligatorio.' })
  @IsUUID()
  contrato_id: string;

  @IsNotEmpty({ message: 'El ID de la marca es obligatorio.' })
  @IsUUID()  
  marca_id: string;


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