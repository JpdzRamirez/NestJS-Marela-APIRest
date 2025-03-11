import { Type } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, Matches, IsArray, IsOptional, ValidateNested, IsInt } from 'class-validator';
export class ClientsDto {

  @IsNotEmpty({ message: 'El id es obligatorio' })
  @IsInt({ message: 'El id debe ser entero' })
  id!: number;

  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @Matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, { message: 'El nombre solo debe contener letras y espacios' })
  nombre!: string;

  @IsOptional()
  @IsString()
  @Matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, { message: 'El apellido solo debe contener letras y espacios' })
  apellido?: string;

  @IsEmail({}, { message: 'El email no es válido' })
  @IsOptional()
  correo?: string;

  @IsNotEmpty({ message: 'El documento no puede estar vacío' })
  @IsString({ message: 'El documento debe ser un número' })
  numeroDocumento!: string;

  @IsOptional()
  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  telefono?: string;

  @IsOptional()
  @IsString({ message: 'La dirección debe ser una cadena de texto' })
  direccion?: string;

  @IsOptional({ message: 'La ciudad debe ser un numero' })
  @IsInt()
  ciudad?: number;

  @IsOptional()
  @IsInt()
  tipoDocumento?: number;

  @IsOptional()
  @IsInt()
  tipoCliente?: number;

  @IsString()
  @IsOptional() 
  source_failure?: string;

  @IsNotEmpty({ message: 'El id_client no puede estar vacío' })
  @IsInt()
  id_client!: number;

}

export class ClientArrayDto {
  @IsArray({ message: 'El cuerpo debe ser un array de clientes' })
  @ValidateNested({ each: true })
  @Type(() => ClientsDto)
  @IsNotEmpty({ message: 'El array de clientes no puede estar vacío' })
  clients!: ClientsDto[];
}