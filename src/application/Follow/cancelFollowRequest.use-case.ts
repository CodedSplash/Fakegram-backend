import { Inject, Injectable } from '@nestjs/common';
import { UserIdVO } from '@domain/User/value-objects/userId.vo';
import { FollowRequestInputDto } from '@application/Follow/dtos/followRequest.input.dto';
import {
  IFollowRequestDbRepository,
  FOLLOW_REQUEST_DB_REPOSITORY,
} from '@domain/Follow/repositories/followRequest.db.repository.inter';

@Injectable()
export class CancelFollowRequestUseCase {
  constructor(
    @Inject(FOLLOW_REQUEST_DB_REPOSITORY)
    private readonly followRequestDbRepository: IFollowRequestDbRepository,
  ) {}

  async execute(dto: FollowRequestInputDto) {
    await this.followRequestDbRepository.delete(
      new UserIdVO(dto.requesterId),
      new UserIdVO(dto.targetId),
    );

    return {
      isSuccess: true,
      message: 'Запрос на подписку отменён.',
    };
  }
}
