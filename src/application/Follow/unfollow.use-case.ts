import { Inject, Injectable } from '@nestjs/common';
import { UserIdVO } from '@domain/User/value-objects/userId.vo';
import { FollowInputDto } from '@application/Follow/dtos/follow.input.dto';
import {
  IFollowDbRepository,
  FOLLOW_DB_REPOSITORY,
} from '@domain/Follow/repositories/follow.db.repository.inter';

@Injectable()
export class UnfollowUseCase {
  constructor(
    @Inject(FOLLOW_DB_REPOSITORY)
    private readonly followDbRepository: IFollowDbRepository,
  ) {}

  async execute(dto: FollowInputDto) {
    await this.followDbRepository.deleteByFollowerAndFollowingId(
      new UserIdVO(dto.followerId),
      new UserIdVO(dto.followingId),
    );

    return {
      isSuccess: true,
      message: 'Вы успешно отписались от пользователя.',
    };
  }
}
