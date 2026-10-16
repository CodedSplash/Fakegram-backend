import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from '@domain/common/errors/domain.error';

export class AlreadyFollowingError extends ConflictError {
  constructor() {
    super('Вы уже подписаны на данного пользователя.');
  }
}

export class NotFollowingError extends NotFoundError {
  constructor() {
    super('Вы не подписаны на данного пользователя.');
  }
}

export class SelfFollowError extends ValidationError {
  constructor() {
    super('Нельзя подписаться на самого себя.');
  }
}

export class InvalidCursorError extends ValidationError {
  constructor() {
    super('Некорректный курсор пагинации.');
  }
}

// Аккаунт стал закрытым или открытым между проверкой и записью:
// use case один раз повторяет действие другим способом (подписка ↔ запрос)
export class AccountPrivacyChangedError extends ConflictError {
  constructor() {
    super('Настройки приватности аккаунта изменились, повторите запрос.');
  }
}
