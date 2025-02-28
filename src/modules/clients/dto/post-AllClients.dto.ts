import { IsDate, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer'; // Importa Type para transformar los datos


export class PostAllClientsDto {
  @IsDate({ message: 'La fecha de inicio debe ser una fecha válida' })
  @IsNotEmpty({ message: 'La fecha de inicio es obligatoria' })
  @Type(() => Date) // Transforma la cadena a Date automáticamente
  startDate: Date;

}