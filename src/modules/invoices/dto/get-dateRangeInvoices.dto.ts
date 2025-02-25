import { IsUUID, IsDateString } from 'class-validator';
import { IsDateRangeValid } from '../../../shared/validators/date-range.validator'; // Importa el validador personalizado

export class GetDateRangeInvoicesDto {

  @IsDateString({}, { message: 'La fecha de inicio debe ser una fecha válida en formato ISO 8601' })
  startDate: string;

  @IsDateString({}, { message: 'La fecha de fin debe ser una fecha válida en formato ISO 8601' })
  @IsDateRangeValid('startDate', { message: 'La fecha de fin debe ser posterior o igual a la fecha de inicio' })
  endDate: string;
}