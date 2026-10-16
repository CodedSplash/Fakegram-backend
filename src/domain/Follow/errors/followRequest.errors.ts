import {
  ConflictError,
  NotFoundError,
} from '@domain/common/errors/domain.error';

export class FollowRequestAlreadyExistsError extends ConflictError {
  constructor() {
    super('Запрос на подписку уже отправлен.');
  }
}

export class FollowRequestNotFoundError extends NotFoundError {
  constructor() {
    super('Запрос на подписку не найден.');
  }
}
