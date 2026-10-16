import { ValidationError } from '@domain/common/errors/domain.error';

export class EmailVO {
  private static EMAIL_REGEX = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;

  constructor(readonly value: string) {
    if (!this.validation(value)) {
      throw new ValidationError('Email adress incorrect!');
    }
  }

  validation(newEmail: string): boolean {
    return (
      EmailVO.EMAIL_REGEX.test(newEmail) &&
      newEmail.length <= 254 &&
      !newEmail.includes('..') &&
      newEmail.split('@')[0].length <= 64
    );
  }

  equals(id: EmailVO): boolean {
    return id.value === this.value;
  }

  toString(): string {
    return this.value;
  }
}
