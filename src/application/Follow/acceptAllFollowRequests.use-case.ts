import { Inject, Injectable } from '@nestjs/common';
import { UserIdVO } from '@domain/User/value-objects/userId.vo';
import {
  IFollowRequestDbRepository,
  FOLLOW_REQUEST_DB_REPOSITORY,
} from '@domain/Follow/repositories/followRequest.db.repository.inter';

const BATCH_SIZE = 100;

// Принимает все входящие запросы владельца (аккаунт стал открытым).
// Каждая пачка — отдельная транзакция: удаление запросов, подписки и
// outbox-события. Повторный вызов безопасен и догонит оставшиеся запросы.
@Injectable()
export class AcceptAllFollowRequestsUseCase {
  constructor(
    @Inject(FOLLOW_REQUEST_DB_REPOSITORY)
    private readonly followRequestDbRepository: IFollowRequestDbRepository,
  ) {}

  // Возвращает число созданных подписок.
  async execute(ownerId: string): Promise<number> {
    const owner = new UserIdVO(ownerId);
    let accepted = 0;

    // Пачка удаляет все выбранные запросы, поэтому цикл конечен;
    // неполная пачка — запросов больше нет.
    for (;;) {
      const batch = await this.followRequestDbRepository.acceptBatch(
        owner,
        BATCH_SIZE,
      );
      accepted += batch.accepted;

      if (batch.selected < BATCH_SIZE) return accepted;
    }
  }
}
