import { Module } from '@nestjs/common';
import { DbModule } from '@infrastructure/db/db.module';
import { RefreshTokenDbRepository } from '@infrastructure/db/repositories/Jwt/refreshToken.db.repository';
import { FollowDbRepository } from '@infrastructure/db/repositories/Follow/follow.db.repository';
import { UserDbRepository } from '@infrastructure/db/repositories/User/user.db.repository';
import { REFRESH_TOKEN_DB_REPOSITORY } from '@domain/Jwt/repositories/refreshToken.db.repository.inter';
import { FOLLOW_DB_REPOSITORY } from '@domain/Follow/repositories/follow.db.repository.inter';
import { USER_DB_REPOSITORY } from '@domain/User/repositories/user.db.repository.inter';
import { FollowRequestDbRepository } from '@infrastructure/db/repositories/Follow/followRequest.db.repository';
import { BlockDbRepository } from '@infrastructure/db/repositories/Block/block.db.repository';
import { FOLLOW_REQUEST_DB_REPOSITORY } from '@domain/Follow/repositories/followRequest.db.repository.inter';
import { BLOCK_DB_REPOSITORY } from '@domain/Block/repositories/block.db.repository.inter';

@Module({
  imports: [DbModule],
  providers: [
    {
      provide: REFRESH_TOKEN_DB_REPOSITORY,
      useClass: RefreshTokenDbRepository,
    },
    { provide: USER_DB_REPOSITORY, useClass: UserDbRepository },
    { provide: FOLLOW_DB_REPOSITORY, useClass: FollowDbRepository },
    {
      provide: FOLLOW_REQUEST_DB_REPOSITORY,
      useClass: FollowRequestDbRepository,
    },
    { provide: BLOCK_DB_REPOSITORY, useClass: BlockDbRepository },
  ],
  exports: [
    REFRESH_TOKEN_DB_REPOSITORY,
    USER_DB_REPOSITORY,
    FOLLOW_DB_REPOSITORY,
    FOLLOW_REQUEST_DB_REPOSITORY,
    BLOCK_DB_REPOSITORY,
  ],
})
export class RepositoryDbModule {}
