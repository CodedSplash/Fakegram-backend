import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from '@domain/common/errors/domain.error';

// Нейтральное сообщение: не раскрываем, кто кого заблокировал.
export class UserBlockedError extends ForbiddenError {
  constructor() {
    super('Действие недоступно.');
  }
}

export class SelfBlockError extends ValidationError {
  constructor() {
    super('Нельзя заблокировать самого себя.');
  }
}

export class AlreadyBlockedError extends ConflictError {
  constructor() {
    super('Пользователь уже заблокирован.');
  }
}

export class NotBlockedError extends NotFoundError {
  constructor() {
    super('Пользователь не заблокирован.');
  }
}
