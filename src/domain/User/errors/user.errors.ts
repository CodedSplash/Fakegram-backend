import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from '@domain/common/errors/domain.error';

export class UserNotFoundError extends NotFoundError {
  constructor() {
    super('Пользователь не найден!');
  }
}

export class UserAlreadyExistsError extends ConflictError {
  constructor() {
    super('Пользователь уже зарегистрирован.');
  }
}

export class InvalidCredentialsError extends UnauthorizedError {
  constructor() {
    super('Вы ввели неверные данные!');
  }
}

export class PrivateAccountError extends ForbiddenError {
  constructor() {
    super('Это закрытый аккаунт.');
  }
}

export class UsernameAlreadyTakenError extends ConflictError {
  constructor() {
    super('Этот username уже занят.');
  }
}

export class EmailAlreadyTakenError extends ConflictError {
  constructor() {
    super('Этот email уже используется.');
  }
}

export class PhoneNumberAlreadyTakenError extends ConflictError {
  constructor() {
    super('Этот номер телефона уже используется.');
  }
}

export class InvalidCurrentPasswordError extends UnauthorizedError {
  constructor() {
    super('Текущий пароль введён неверно!');
  }
}

export class SamePasswordError extends ValidationError {
  constructor() {
    super('Новый пароль должен отличаться от текущего.');
  }
}

export class SameUsernameError extends ValidationError {
  constructor() {
    super('Новый username совпадает с текущим.');
  }
}

export class SameEmailError extends ValidationError {
  constructor() {
    super('Новый email совпадает с текущим.');
  }
}
