import { IsEmail, IsNotEmpty, IsString, Matches, MinLength, IsOptional, IsNumber, IsInt } from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'El email no es válido' })
  @IsNotEmpty({ message: 'El email es obligatorio' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @Matches(/[A-Z]/, { message: 'Debe contener al menos una letra mayúscula' })
  @Matches(/\d/, { message: 'Debe contener al menos un número' })
  @Matches(/[@$!%*?&]/, { message: 'Debe contener al menos un carácter especial (@$!%*?&)' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @Matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, { message: 'El nombre solo debe contener letras y espacios' })
  name: string;

  @IsOptional()
  @IsString()
  @Matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, { message: 'El apellido solo debe contener letras y espacios' })
  lastname?: string;

  @IsNotEmpty({ message: 'El documento no puede estar vacío' })
  @IsString({ message: 'El documento debe ser un número' })
  document: string;

  @IsOptional()
  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  phone?: string;

  @IsOptional()
  @IsString({ message: 'La dirección debe ser una cadena de texto' })
  address?: string;

  @IsNotEmpty({ message: 'El móvil es obligatorio' })
  @IsString()
  mobile: string;

  @IsOptional()
  @IsInt({ message: 'El rol debe ser un número entero positivo' })
  role_id?: number;
}
