import { ValidationError } from '@domain/common/errors/domain.error';

export class UserIdVO {
  constructor(readonly value: string) {
    if (!value) {
      throw new ValidationError('ID cannot be empty.');
    }
  }

  equals(id: UserIdVO): boolean {
    return id.value === this.value;
  }

  toString(): string {
    return this.value;
  }
}
