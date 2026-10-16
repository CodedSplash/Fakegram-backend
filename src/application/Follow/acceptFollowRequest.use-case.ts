import { createId } from '@paralleldrive/cuid2';
import { Inject, Injectable } from '@nestjs/common';
import { Follow } from '@domain/Follow/entities/follow.entity';
import { FollowRequestInputDto } from '@application/Follow/dtos/followRequest.input.dto';
import {
  IFollowRequestDbRepository,
  FOLLOW_REQUEST_DB_REPOSITORY,
} from '@domain/Follow/repositories/followRequest.db.repository.inter';

@Injectable()
export class AcceptFollowRequestUseCase {
  constructor(
    @Inject(FOLLOW_REQUEST_DB_REPOSITORY)
    private readonly followRequestDbRepository: IFollowRequestDbRepository,
  ) {}

  async execute(dto: FollowRequestInputDto) {
    // Удаление запроса, подписка и outbox-событие — одна транзакция.
    await this.followRequestDbRepository.accept(
      new Follow({
        id: createId(),
        followerId: dto.requesterId,
        followingId: dto.targetId,
      }),
    );

    return {
      isSuccess: true,
      message: 'Запрос на подписку принят.',
    };
  }
}
