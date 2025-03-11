import { Type } from 'class-transformer';
import { IsArray, ValidateNested, IsNotEmpty, IsString, Matches, IsInt,IsOptional  } from 'class-validator';

export class TypeDocumentDto {
  @IsNotEmpty({ message: 'El id es obligatorio' })
  @IsInt({ message: 'El id debe ser entero' })
  id!: number;

  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @Matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, { message: 'El nombre solo debe contener letras y espacios' })
  nombre!: string;

  @IsString()
  @IsOptional()   
  source_failure?: string;
}
export class TypeDocumentArrayDto {
  @IsArray({ message: 'El cuerpo debe ser un array de clientes' })
  @ValidateNested({ each: true })
  @Type(() => TypeDocumentDto)
  @IsNotEmpty({ message: 'El array de clientes no puede estar vacío' })
  type_document!: TypeDocumentDto[];
}