import { IsEmail, IsOptional, IsString, Matches, MinLength, IsNumber, IsInt } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail({}, { message: 'El email no es válido' })
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @Matches(/[A-Z]/, { message: 'Debe contener al menos una letra mayúscula' })
  @Matches(/\d/, { message: 'Debe contener al menos un número' })
  @Matches(/[@$!%*?&]/, { message: 'Debe contener al menos un carácter especial (@$!%*?&)' })
  password?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, { message: 'El apellido solo debe contener letras y espacios' })
  lastname?: string;

  @IsOptional()
  @IsString({ message: 'El documento debe ser un número' })
  document?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d+$/, { message: 'El teléfono debe ser un número' })
  phone?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d+$/, { message: 'El móvil debe ser un número' })
  mobile?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  @Matches(/^(user|admin|guest)$/, { message: 'Rol inválido' })
  role?: string;
}
