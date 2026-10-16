import { Inject, Injectable } from '@nestjs/common';
import { UserIdVO } from '@domain/User/value-objects/userId.vo';
import { FollowListInputDto } from '@application/Follow/dtos/followList.input.dto';
import { FollowListOutputDto } from '@application/Follow/dtos/followList.output.dto';
import {
  decodeFollowListCursor,
  toFollowListPage,
} from '@application/Follow/utils/followListCursor.util';
import { assertCanViewFollowList } from '@application/Follow/utils/followListAccess.util';
import {
  IFollowDbRepository,
  FOLLOW_DB_REPOSITORY,
} from '@domain/Follow/repositories/follow.db.repository.inter';

@Injectable()
export class GetFollowingsUseCase {
  constructor(
    @Inject(FOLLOW_DB_REPOSITORY)
    private readonly followDbRepository: IFollowDbRepository,
  ) {}

  async execute(dto: FollowListInputDto): Promise<FollowListOutputDto> {
    const userId = new UserIdVO(dto.userId);
    const viewerId = new UserIdVO(dto.viewerId);
    // Курсор проверяем до обращения к БД.
    const cursor = decodeFollowListCursor(dto.cursor);

    await assertCanViewFollowList(this.followDbRepository, userId, viewerId);

    const rows = await this.followDbRepository.findFollowings(
      userId,
      viewerId,
      dto.limit + 1,
      cursor,
    );

    return toFollowListPage(rows, dto.limit);
  }
}
