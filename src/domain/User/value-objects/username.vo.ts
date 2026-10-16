import { ValidationError } from '@domain/common/errors/domain.error';

export class UsernameVO {
  private static USERNAME_REGEX =
    /^[a-z0-9](?!.*[._-]{2})[a-z0-9._-]{1,28}[a-z0-9]$/i;

  constructor(readonly value: string) {
    if (!value.trim()) {
      throw new ValidationError('Username cannot be empty.');
    }
    if (value.length < 3 || value.length > 30) {
      throw new ValidationError(
        'Username must be between 3 and 30 characters.',
      );
    }
    if (!UsernameVO.USERNAME_REGEX.test(value)) {
      throw new ValidationError('Username has an incorrect format.');
    }
  }

  equals(username: UsernameVO): boolean {
    return username.value === this.value;
  }

  toString(): string {
    return this.value;
  }
}
