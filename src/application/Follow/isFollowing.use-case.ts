import { Inject, Injectable } from '@nestjs/common';
import { UserIdVO } from '@domain/User/value-objects/userId.vo';
import { FollowInputDto } from '@application/Follow/dtos/follow.input.dto';
import { IsFollowingOutputDto } from '@application/Follow/dtos/isFollowing.output.dto';
import { FollowStatus } from '@domain/Follow/types/followRelation.type';
import {
  IFollowDbRepository,
  FOLLOW_DB_REPOSITORY,
} from '@domain/Follow/repositories/follow.db.repository.inter';

@Injectable()
export class IsFollowingUseCase {
  constructor(
    @Inject(FOLLOW_DB_REPOSITORY)
    private readonly followDbRepository: IFollowDbRepository,
  ) {}

  async execute(dto: FollowInputDto): Promise<IsFollowingOutputDto> {
    const relation = await this.followDbRepository.findRelation(
      new UserIdVO(dto.followerId),
      new UserIdVO(dto.followingId),
    );

    // Несуществующий пользователь — 'none', как и раньше, без 404.
    let status: FollowStatus = 'none';
    if (relation?.isFollowing) {
      status = 'following';
    } else if (relation?.isRequested) {
      status = 'requested';
    }

    return { isFollowing: status === 'following', status };
  }
}
