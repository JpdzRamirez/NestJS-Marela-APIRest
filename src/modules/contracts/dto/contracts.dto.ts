import { IsDate,IsArray, ValidateNested, IsNotEmpty, IsString, Matches, IsInt,IsOptional, IsUUID,Length } from 'class-validator';
import { Type } from 'class-transformer'; // Importa Type para transformar los datos
import { IsDateRangeValid } from '../../../shared/validators/date-range.validator'; // Importa el validador personalizado

export class GetDateRangeContractsDto {
  @IsDate({ message: 'La fecha de inicio debe ser una fecha válida' })
  @IsNotEmpty({ message: 'La fecha de inicio es obligatoria' })
  @Type(() => Date) // Transforma la cadena a Date automáticamente
  startDate: Date;

  @IsDate({ message: 'La fecha de fin debe ser una fecha válida' })
  @IsNotEmpty({ message: 'La fecha de fin es obligatoria' })
  @IsDateRangeValid('startDate', { message: 'La fecha de fin debe ser posterior o igual a la fecha de inicio' })
  @Type(() => Date) // Transforma la cadena a Date automáticamente
  endDate: Date;
}

export class ContractsDto {
  @IsNotEmpty({ message: 'El id es obligatorio' })
  @IsInt({ message: 'El id debe ser entero' })
  id!: number;

  @IsNotEmpty({ message: 'El ID del medidor no puede estar vacío' })
  @IsUUID() 
  id_contrato!: string;

  @IsNotEmpty({ message: 'La fecha es obligatoria' })
  @Type(() => Date) // Convierte el valor a tipo Date automáticamente
  @IsDate({ message: 'La fecha debe ser un objeto Date válido' })
  fecha!: Date;

  @IsNotEmpty({ message: 'El cliente_id no puede estar vacío' })
  @IsUUID() 
  cliente_id!: string;

  @IsNotEmpty({ message: 'El medidor_id no puede estar vacío' })
  @IsUUID() 
  medidor_id!: string;

  @IsNotEmpty({ message: 'El tiposervicio_id no puede estar vacío' })
  @IsUUID() 
  tiposervicio_id!: string;

  @IsNotEmpty({ message: 'El tiposervicio_id no puede estar vacío' })
  @IsUUID() 
  unidad_municipal_id!: string;

  @IsString()
  @IsOptional() 
  source_failure?: string;
}
export class ContractsArrayDto {
  @IsArray({ message: 'El cuerpo debe ser un array de medidores' })
  @ValidateNested({ each: true })
  @Type(() => ContractsDto)
  @IsNotEmpty({ message: 'El array de medidores no puede estar vacío' })
  contracts!: ContractsDto[];
}