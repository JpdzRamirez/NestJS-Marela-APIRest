import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, Matches, IsArray, IsOptional, ValidateNested, IsInt, IsUUID } from 'class-validator';
export class TypeServiceDto {

  @IsNotEmpty({ message: 'El id es obligatorio' })
  @IsInt({ message: 'El id debe ser entero' })
  id!: number;

  @IsNotEmpty({ message: 'El id_ciudad no puede estar vacío' })
  @IsUUID()
  id_tiposervicio!: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @Matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, { message: 'El nombre solo debe contener letras y espacios' })
  nombre!: string;
  
  @IsNotEmpty({ message: 'El codigo es obligatorio' })
  @IsInt()  
  cargo_fijo!: number;

  @IsString()
  @IsOptional() 
  source_failure?: string;

}

export class TypeServiceArrayDto {
  @IsArray({ message: 'El cuerpo debe ser un array de clientes' })
  @ValidateNested({ each: true })
  @Type(() => TypeServiceDto)
  @IsNotEmpty({ message: 'El array de clientes no puede estar vacío' })
  types_services!: TypeServiceDto[];
}