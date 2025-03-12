import { Type } from 'class-transformer';
import { IsArray, ValidateNested, IsNotEmpty, IsString, Matches, IsInt,IsOptional, IsUUID  } from 'class-validator';

export class TypeClientDto {
  @IsNotEmpty({ message: 'El id es obligatorio' })
  @IsInt({ message: 'El id debe ser entero' })
  id!: number;

  @IsNotEmpty({ message: 'El id_tipocliente no puede estar vacío' })
  @IsUUID() 
  id_tipocliente!: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @Matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, { message: 'El nombre solo debe contener letras y espacios' })
  nombre!: string;

  @IsString()
  @IsOptional() 
  source_failure?: string;
}
export class TypeClientArrayDto {
  @IsArray({ message: 'El cuerpo debe ser un array de clientes' })
  @ValidateNested({ each: true })
  @Type(() => TypeClientDto)
  @IsNotEmpty({ message: 'El array de clientes no puede estar vacío' })
  type_clients!: TypeClientDto[];
}