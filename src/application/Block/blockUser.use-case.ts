import { Inject, Injectable } from '@nestjs/common';
import { UserIdVO } from '@domain/User/value-objects/userId.vo';
import { BlockInputDto } from '@application/Block/dtos/block.input.dto';
import { UserNotFoundError } from '@domain/User/errors/user.errors';
import { SelfBlockError } from '@domain/Block/errors/block.errors';
import {
  IFollowDbRepository,
  FOLLOW_DB_REPOSITORY,
} from '@domain/Follow/repositories/follow.db.repository.inter';
import {
  IBlockDbRepository,
  BLOCK_DB_REPOSITORY,
} from '@domain/Block/repositories/block.db.repository.inter';

@Injectable()
export class BlockUserUseCase {
  constructor(
    @Inject(FOLLOW_DB_REPOSITORY)
    private readonly followDbRepository: IFollowDbRepository,
    @Inject(BLOCK_DB_REPOSITORY)
    private readonly blockDbRepository: IBlockDbRepository,
  ) {}

  async execute(dto: BlockInputDto) {
    const blockerId = new UserIdVO(dto.blockerId);
    const blockedId = new UserIdVO(dto.blockedId);

    if (blockerId.equals(blockedId)) {
      throw new SelfBlockError();
    }

    const relation = await this.followDbRepository.findRelation(
      blockerId,
      blockedId,
    );

    // Деактивированный аккаунт для клиента не существует.
    if (!relation || !relation.isActive) {
      throw new UserNotFoundError();
    }

    // Блокировка и удаление подписок (с outbox-событиями отписки) и запросов
    // в обе стороны — одна транзакция. Повтор ловится уникальностью (409).
    await this.blockDbRepository.block(blockerId, blockedId);

    return {
      isSuccess: true,
      message: 'Пользователь заблокирован.',
    };
  }
}
