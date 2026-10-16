import { Inject, Injectable } from '@nestjs/common';
import { UserIdVO } from '@domain/User/value-objects/userId.vo';
import { FollowRequestListInputDto } from '@application/Follow/dtos/followRequestList.input.dto';
import { FollowRequestListOutputDto } from '@application/Follow/dtos/followRequestList.output.dto';
import {
  decodeFollowListCursor,
  encodeFollowListCursor,
} from '@application/Follow/utils/followListCursor.util';
import {
  IFollowRequestDbRepository,
  FOLLOW_REQUEST_DB_REPOSITORY,
} from '@domain/Follow/repositories/followRequest.db.repository.inter';

@Injectable()
export class GetFollowRequestsUseCase {
  constructor(
    @Inject(FOLLOW_REQUEST_DB_REPOSITORY)
    private readonly followRequestDbRepository: IFollowRequestDbRepository,
  ) {}

  async execute(
    dto: FollowRequestListInputDto,
  ): Promise<FollowRequestListOutputDto> {
    // Формат курсора общий со списками подписок: `createdAt|id запроса`.
    // Проверяем до обращения к БД.
    const cursor = decodeFollowListCursor(dto.cursor);

    const rows = await this.followRequestDbRepository.findIncoming(
      new UserIdVO(dto.userId),
      dto.limit + 1,
      cursor && { createdAt: cursor.createdAt, requestId: cursor.followId },
    );

    // Запрошено limit + 1: лишняя запись — признак следующей страницы.
    const page = rows.slice(0, dto.limit);
    const last = page[page.length - 1];

    return {
      items: page.map((item) => ({
        id: item.id,
        username: item.username,
        displayName: item.displayName,
        profilePhotoUrl: item.profilePhotoUrl,
        isVerified: item.isVerified,
        requestedAt: item.requestedAt,
      })),
      nextCursor:
        rows.length > dto.limit
          ? encodeFollowListCursor({
              createdAt: last.requestedAt,
              followId: last.requestId,
            })
          : null,
    };
  }
}
