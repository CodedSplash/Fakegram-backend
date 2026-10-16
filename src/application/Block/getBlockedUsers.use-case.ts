import { Inject, Injectable } from '@nestjs/common';
import { UserIdVO } from '@domain/User/value-objects/userId.vo';
import { BlockListInputDto } from '@application/Block/dtos/blockList.input.dto';
import { BlockListOutputDto } from '@application/Block/dtos/blockList.output.dto';
import {
  decodeFollowListCursor,
  encodeFollowListCursor,
} from '@application/Follow/utils/followListCursor.util';
import {
  IBlockDbRepository,
  BLOCK_DB_REPOSITORY,
} from '@domain/Block/repositories/block.db.repository.inter';

@Injectable()
export class GetBlockedUsersUseCase {
  constructor(
    @Inject(BLOCK_DB_REPOSITORY)
    private readonly blockDbRepository: IBlockDbRepository,
  ) {}

  async execute(dto: BlockListInputDto): Promise<BlockListOutputDto> {
    // Формат курсора общий со списками подписок: `createdAt|blockedId`.
    // Проверяем до обращения к БД.
    const cursor = decodeFollowListCursor(dto.cursor);

    const rows = await this.blockDbRepository.findBlocked(
      new UserIdVO(dto.userId),
      dto.limit + 1,
      cursor && { createdAt: cursor.createdAt, blockedId: cursor.followId },
    );

    // Запрошено limit + 1: лишняя запись — признак следующей страницы.
    const page = rows.slice(0, dto.limit);
    const last = page[page.length - 1];

    return {
      items: page,
      nextCursor:
        rows.length > dto.limit
          ? encodeFollowListCursor({
              createdAt: last.blockedAt,
              followId: last.id,
            })
          : null,
    };
  }
}
