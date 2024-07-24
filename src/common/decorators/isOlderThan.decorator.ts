import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsOlderThan(
  minAge: number,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isOlderThan',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          const date = new Date(value);
          const now = new Date();
          const age = now.getFullYear() - date.getFullYear();
          const monthDiff = now.getMonth() - date.getMonth();
          const dayDiff = now.getDate() - date.getDate();

          if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
            return age - 1 >= minAge;
          }

          return age >= minAge;
        },
        defaultMessage() {
          return `User must be at least ${minAge} years old`;
        },
      },
    });
  };
}
