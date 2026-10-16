import { isCuid as isCuidParralleldrive } from '@paralleldrive/cuid2';
import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsCuid(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isCuid',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          return isCuidParralleldrive(value);
        },
        defaultMessage() {
          return 'The Cuid has an incorrect format.';
        },
      },
    });
  };
}
