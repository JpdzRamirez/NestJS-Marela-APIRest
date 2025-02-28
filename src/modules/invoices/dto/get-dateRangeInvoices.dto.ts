import { IsDate, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer'; // Importa Type para transformar los datos
import { IsDateRangeValid } from '../../../shared/validators/date-range.validator'; // Importa el validador personalizado

export class GetDateRangeInvoicesDto {
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