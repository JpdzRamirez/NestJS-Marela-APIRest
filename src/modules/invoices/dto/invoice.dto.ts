import { Type } from 'class-transformer';
import { IsNotEmpty,IsDate, IsString, IsArray, IsOptional, ValidateNested, IsInt, IsUUID, IsNumber, IsBoolean } from 'class-validator';
import { IsDateRangeValid } from '../../../shared/validators/date-range.validator'; // Importa el validador personalizado
export class InvoiceDto {

  @IsNotEmpty({ message: 'El id es obligatorio' })
  @IsInt({ message: 'El id debe ser entero' })
  id!: number;

  @IsNotEmpty({ message: 'El id_factura no puede estar vacío' })
  @IsUUID()
  id_factura!: string;

  @IsString()
  @IsOptional()  
  qr!: string | null;
  
  @IsNotEmpty({ message: 'El consumo es obligatorio' })
  @IsNumber()  
  consumo!: number;

  @IsNotEmpty({ message: 'El contotalsumo es obligatorio' })
  @IsNumber()  
  total!: number;

  @IsNotEmpty({ message: 'El folio es obligatorio' })
  @IsNumber()  
  folio!: number;

  @IsNotEmpty({ message: 'El pagada es obligatorio' })
  @IsBoolean()  
  pagada!: boolean;

  @IsNotEmpty({ message: 'La fecha_lectura es obligatoria' })
  @Type(() => Date) // Convierte el valor a tipo Date automáticamente
  @IsDate({ message: 'La fecha_lectura debe ser un objeto Date válido' })
  fecha_lectura!: Date;

  @IsNotEmpty({ message: 'La lectura_actual es obligatorio' })
  @IsNumber()  
  lectura_actual!: number;

  @IsNotEmpty({ message: 'La lectura_anterior es obligatorio' })
  @IsNumber()  
  lectura_anterior?: number;

  @IsNotEmpty({ message: 'La fecha_pago es obligatoria' })
  @Type(() => Date) // Convierte el valor a tipo Date automáticamente
  @IsDate({ message: 'La fecha_pago debe ser un objeto Date válido' })
  fecha_pago?: Date;

  @IsNotEmpty({ message: 'La fecha de pago oportuno es obligatoria' })
  @Type(() => Date) // Convierte el valor a tipo Date automáticamente
  @IsDate({ message: 'La fecha de pago oportuno debe ser un objeto Date válido' })
  fecha_pago_oportuno!: Date;

  @IsNotEmpty({ message: 'El contrato_id no puede estar vacío' })
  @IsUUID() 
  contrato_id!: string;
  
  @IsNotEmpty({ message: 'El user_id no puede estar vacío' })
  @IsUUID() 
  user_id!: string;

  @IsOptional() 
  @IsNumber()
  source_failure?: string;

}

export class InvoiceArrayDto {
  @IsArray({ message: 'El cuerpo debe ser un array de clientes' })
  @ValidateNested({ each: true })
  @Type(() => InvoiceDto)
  @IsNotEmpty({ message: 'El array de clientes no puede estar vacío' })
  invoices!: InvoiceDto[];
}

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