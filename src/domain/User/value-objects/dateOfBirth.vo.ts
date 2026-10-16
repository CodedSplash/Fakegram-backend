import { ValidationError } from '@domain/common/errors/domain.error';

export class DateOfBirthVO {
  constructor(private readonly _value: Date) {
    if (!this._validate(_value)) {
      throw new ValidationError('You can register only from the age of 18.');
    }
  }

  private _validate(date: Date): boolean {
    const now = Date.now();
    const birthDate = new Date(date);

    if (birthDate.setFullYear(birthDate.getFullYear() + 18) > now) {
      return false;
    }

    return true;
  }

  equals(date: DateOfBirthVO): boolean {
    return this._value.getTime() === date.value.getTime();
  }

  toString(): string {
    return this._value.toLocaleDateString();
  }

  get value() {
    return new Date(this._value.getTime());
  }
}
