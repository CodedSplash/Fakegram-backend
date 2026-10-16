import { Inject, Injectable } from '@nestjs/common';
import { UserIdVO } from '@domain/User/value-objects/userId.vo';
import { BlockInputDto } from '@application/Block/dtos/block.input.dto';
import {
  IBlockDbRepository,
  BLOCK_DB_REPOSITORY,
} from '@domain/Block/repositories/block.db.repository.inter';

@Injectable()
export class UnblockUserUseCase {
  constructor(
    @Inject(BLOCK_DB_REPOSITORY)
    private readonly blockDbRepository: IBlockDbRepository,
  ) {}

  async execute(dto: BlockInputDto) {
    await this.blockDbRepository.unblock(
      new UserIdVO(dto.blockerId),
      new UserIdVO(dto.blockedId),
    );

    return {
      isSuccess: true,
      message: 'Пользователь разблокирован.',
    };
  }
}
