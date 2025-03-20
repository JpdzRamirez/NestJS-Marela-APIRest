import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, Matches, IsArray, IsOptional, ValidateNested, IsInt, IsUUID } from 'class-validator';
export class UnitDto {

  @IsNotEmpty({ message: 'El id es obligatorio' })
  @IsInt({ message: 'El id debe ser entero' })
  id!: number;

  @IsNotEmpty({ message: 'El id_unidad no puede estar vacío' })
  @IsUUID()
  id_unidad!: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @Matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, { message: 'El nombre solo debe contener letras y espacios' })
  nombre!: string;
  
  @IsString()
  @IsOptional() 
  source_failure?: string;

}

export class UnitsArrayDto {
  @IsArray({ message: 'El cuerpo debe ser un array de unidades' })
  @ValidateNested({ each: true })
  @Type(() => UnitDto)
  @IsNotEmpty({ message: 'El array de unidades no puede estar vacío' })
  units!: UnitDto[];
}