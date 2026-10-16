import { createId } from '@paralleldrive/cuid2';
import { Inject, Injectable } from '@nestjs/common';
import { Follow } from '@domain/Follow/entities/follow.entity';
import { FollowRequest } from '@domain/Follow/entities/followRequest.entity';
import { FollowInputDto } from '@application/Follow/dtos/follow.input.dto';
import { FollowOutputDto } from '@application/Follow/dtos/follow.output.dto';
import { AuthorizationError } from '@domain/Jwt/errors/jwt.errors';
import { UserNotFoundError } from '@domain/User/errors/user.errors';
import {
  AccountPrivacyChangedError,
  AlreadyFollowingError,
} from '@domain/Follow/errors/follow.errors';
import { FollowRequestAlreadyExistsError } from '@domain/Follow/errors/followRequest.errors';
import { UserBlockedError } from '@domain/Block/errors/block.errors';
import {
  IFollowDbRepository,
  FOLLOW_DB_REPOSITORY,
} from '@domain/Follow/repositories/follow.db.repository.inter';
import {
  IFollowRequestDbRepository,
  FOLLOW_REQUEST_DB_REPOSITORY,
} from '@domain/Follow/repositories/followRequest.db.repository.inter';

@Injectable()
export class FollowUseCase {
  constructor(
    @Inject(FOLLOW_DB_REPOSITORY)
    private readonly followDbRepository: IFollowDbRepository,
    @Inject(FOLLOW_REQUEST_DB_REPOSITORY)
    private readonly followRequestDbRepository: IFollowRequestDbRepository,
  ) {}

  async execute(dto: FollowInputDto): Promise<FollowOutputDto> {
    const follow = new Follow({
      id: createId(),
      followerId: dto.followerId,
      followingId: dto.followingId,
    });

    const relation = await this.followDbRepository.findRelation(
      follow.followerId,
      follow.followingId,
    );

    if (relation && !relation.isViewerExists) {
      throw new AuthorizationError();
    }

    // На деактивированный аккаунт подписаться нельзя — для клиента его нет.
    if (!relation || !relation.isActive) {
      throw new UserNotFoundError();
    }

    if (relation.isBlocked) {
      throw new UserBlockedError();
    }

    if (relation.isFollowing) {
      throw new AlreadyFollowingError();
    }

    // Закрытый аккаунт: вместо подписки — запрос, владелец решает сам.
    if (relation.isPrivate && relation.isRequested) {
      throw new FollowRequestAlreadyExistsError();
    }

    // Блокировка и приватность повторно проверяются в транзакции записи. Если
    // приватность сменилась между чтением и записью — один раз пробуем другой путь.
    try {
      return await this.followOrRequest(follow, relation.isPrivate);
    } catch (error: unknown) {
      if (!(error instanceof AccountPrivacyChangedError)) throw error;

      return this.followOrRequest(follow, !relation.isPrivate);
    }
  }

  private async followOrRequest(
    follow: Follow,
    isPrivate: boolean,
  ): Promise<FollowOutputDto> {
    if (isPrivate) {
      await this.followRequestDbRepository.save(
        new FollowRequest({
          id: createId(),
          requesterId: follow.followerId.toString(),
          targetId: follow.followingId.toString(),
        }),
      );

      return {
        isSuccess: true,
        status: 'requested',
        message: 'Запрос на подписку отправлен.',
      };
    }

    await this.followDbRepository.save(follow);

    return {
      isSuccess: true,
      status: 'following',
      message: 'Вы успешно подписались на пользователя.',
    };
  }
}
