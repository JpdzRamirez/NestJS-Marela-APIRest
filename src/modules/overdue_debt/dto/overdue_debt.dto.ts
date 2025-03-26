import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, Matches, IsArray, IsOptional, ValidateNested, IsInt, IsUUID, IsNumber } from 'class-validator';
export class OverdueDebtDto {

  @IsNotEmpty({ message: 'El id es obligatorio' })
  @IsInt({ message: 'El id debe ser entero' })
  id!: number;

  @IsNotEmpty({ message: 'El id_ciudad no puede estar vacío' })
  @IsUUID()
  id_mora!: string;

  @IsNotEmpty({ message: 'La mora_maxima es obligatorio' })
  @IsInt()  
  mora_maxima!: number;

  @IsString()
  @IsNotEmpty({ message: 'El nombre_mora es obligatorio' })
  @Matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, { message: 'El nombre solo debe contener letras y espacios' })
  nombre_mora!: string;
  
  @IsNotEmpty({ message: 'El valor_unitario es obligatorio' })
  @IsNumber()  
  valor_unitario!: number;

  @IsNotEmpty({ message: 'El tipo_mora es obligatorio' })
  @IsInt()  
  tipo_mora!: number;

  @IsNotEmpty({ message: 'La factura_id no puede estar vacío' })
  @IsUUID()
  factura_id!: string;

  @IsNotEmpty({ message: 'El contrato_id no puede estar vacío' })
  @IsUUID()
  contrato_id!: string;

  @IsString()
  @IsOptional() 
  source_failure?: string;

}

export class OverdueDebtArrayDto {
  @IsArray({ message: 'El cuerpo debe ser un array de moras' })
  @ValidateNested({ each: true })
  @Type(() => OverdueDebtDto)
  @IsNotEmpty({ message: 'El array de moras no puede estar vacío' })
  cities!: OverdueDebtDto[];
}