import { ValidationError } from '@domain/common/errors/domain.error';

export class RefreshTokenIdVO {
  constructor(readonly value: string) {
    if (!value) {
      throw new ValidationError('ID cannot be empty.');
    }
  }

  equals(id: RefreshTokenIdVO): boolean {
    return id.value === this.value;
  }

  toString(): string {
    return this.value;
  }
}
