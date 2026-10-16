import { UserIdVO } from '@domain/User/value-objects/userId.vo';
import {
  BlockListCursor,
  BlockListItem,
} from '@domain/Block/types/blockListItem.type';

export const BLOCK_DB_REPOSITORY = Symbol('BLOCK_DB_REPOSITORY');

export interface IBlockDbRepository {
  // Блокировка и удаление подписок/запросов в обе стороны одной транзакцией.
  block(blockerId: UserIdVO, blockedId: UserIdVO): Promise<void>;
  unblock(blockerId: UserIdVO, blockedId: UserIdVO): Promise<void>;
  findBlocked(
    blockerId: UserIdVO,
    limit: number,
    cursor?: BlockListCursor,
  ): Promise<BlockListItem[]>;
}
