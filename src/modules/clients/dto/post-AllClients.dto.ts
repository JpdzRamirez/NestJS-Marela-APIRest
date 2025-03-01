import { IsEmail, IsNotEmpty, IsString, Matches, IsBoolean, IsOptional, IsNumber, IsInt } from 'class-validator';
export class PostAllClientsDto {

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
  numerodocumento!: string;

  @IsOptional()
  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  telefono?: string;

  @IsOptional()
  @IsString({ message: 'La dirección debe ser una cadena de texto' })
  direccion?: string;

  @IsOptional({ message: 'La ciudad debe ser un numero' })
  @IsInt()
  ciudad?: number;

  @IsNotEmpty({ message: 'Tipo de documento es obligatorio' })
  @IsInt()
  tipoDocumento!: number;

  @IsNotEmpty({ message: 'Tipo de cliente es obligatorio' })
  @IsInt()
  tipoCliente!: number;

  @IsNotEmpty({ message: 'Sincronizado mobil es obligatorio' })
  @IsBoolean({ message: 'Sincronizado Mobil debe ser booleano' })
  sincronizadoMobil!: Boolean;

  @IsNotEmpty({ message: 'Sincronizado Web es obligatorio' })
  @IsBoolean({ message: 'Sincronizado Web debe ser booleano' })
  sincronizadoWeb!: Boolean;
}