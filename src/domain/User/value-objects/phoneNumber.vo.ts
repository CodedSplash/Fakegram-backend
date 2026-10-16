import { ValidationError } from '@domain/common/errors/domain.error';

export class PhoneNumberVO {
  constructor(readonly value: string) {
    const normalizePhoneNumber = this._normalize(value);

    if (!this._validate(normalizePhoneNumber)) {
      throw new ValidationError('The phone number is incorrect.');
    }

    this.value = normalizePhoneNumber;
  }

  private _validate(phoneNumber: string): boolean {
    if (!phoneNumber) {
      return false;
    }

    if (phoneNumber.length > 20 || phoneNumber.length < 5) {
      return false;
    }

    return true;
  }

  private _normalize(phoneNumber: string): string {
    return phoneNumber.replace(/\s+/g, '').replace(/^\+/, '');
  }

  equals(phoneNumber: PhoneNumberVO): boolean {
    return phoneNumber.value === this.value;
  }

  toString(): string {
    return this.value;
  }
}
