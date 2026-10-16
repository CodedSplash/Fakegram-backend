import {
  ConflictError,
  UnauthorizedError,
} from '@domain/common/errors/domain.error';

export class RefreshTokenMissingError extends UnauthorizedError {
  constructor() {
    super('Токен не обнаружен!');
  }
}

export class AuthorizationError extends UnauthorizedError {
  constructor() {
    super('Ошибка авторизации!');
  }
}

export class RefreshTokenAlreadyExistsError extends ConflictError {
  constructor() {
    super('Такой refresh токен уже существует.');
  }
}

export class InvalidAccessTokenError extends UnauthorizedError {
  constructor() {
    super('Токен не валиден!');
  }
}
