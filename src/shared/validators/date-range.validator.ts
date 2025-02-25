import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments, registerDecorator, ValidationOptions } from 'class-validator';

@ValidatorConstraint({ name: 'isDateRangeValid', async: false })
export class IsDateRangeValidConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const [relatedPropertyName] = args.constraints;
    const relatedValue = (args.object as any)[relatedPropertyName];
    return new Date(value) >= new Date(relatedValue); // Devuelve true si startDate <= endDate
  }

  defaultMessage(args: ValidationArguments) {
    return 'La fecha de inicio debe ser anterior o igual a la fecha de fin';
  }
}

export function IsDateRangeValid(property: string, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: IsDateRangeValidConstraint,
    });
  };
}