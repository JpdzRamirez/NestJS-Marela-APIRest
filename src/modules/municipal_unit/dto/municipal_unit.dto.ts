import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, Matches, IsArray, IsOptional, ValidateNested, IsInt, IsUUID } from 'class-validator';
export class MunicipalUnitDto {

  @IsNotEmpty({ message: 'El id es obligatorio' })
  @IsInt({ message: 'El id debe ser entero' })
  id!: number;

  @IsNotEmpty({ message: 'El id_unidadmunicipal no puede estar vacío' })
  @IsUUID()
  id_unidadmunicipal!: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @Matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, { message: 'El nombre solo debe contener letras y espacios' })
  nombre!: string;

  @IsNotEmpty({ message: 'El UUID del departamento de documento es obligatorio.' })
  @IsUUID()  
  departamento_id!: string;

  @IsNotEmpty({ message: 'El UUID de la ciudad es obligatorio.' })
  @IsUUID()  
  ciudad_id!: string;

  @IsString()
  @IsOptional() 
  source_failure?: string;

}

export class MunicipalUnitArrayDto {
  @IsArray({ message: 'El cuerpo debe ser un array de unidades municipales' })
  @ValidateNested({ each: true })
  @Type(() => MunicipalUnitDto)
  @IsNotEmpty({ message: 'El array de unidades municipales no puede estar vacío' })
  municipal_units!: MunicipalUnitDto[];
}