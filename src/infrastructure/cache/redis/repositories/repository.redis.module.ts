import { Module } from '@nestjs/common';
import { RedisModule } from '@infrastructure/cache/redis/redis.module';
import { UserProfileCacheRepository } from '@infrastructure/cache/redis/repositories/User/userProfile.cache.repository';
import { UserTokenVersionCacheRepository } from '@infrastructure/cache/redis/repositories/User/userTokenVersion.cache.repository';
import { USER_PROFILE_CACHE_REPOSITORY } from '@domain/User/repositories/userProfile.cache.repository.inter';
import { USER_TOKEN_VERSION_CACHE_REPOSITORY } from '@domain/User/repositories/userTokenVersion.cache.repository.inter';

@Module({
  imports: [RedisModule.register()],
  providers: [
    {
      provide: USER_PROFILE_CACHE_REPOSITORY,
      useClass: UserProfileCacheRepository,
    },
    {
      provide: USER_TOKEN_VERSION_CACHE_REPOSITORY,
      useClass: UserTokenVersionCacheRepository,
    },
  ],
  exports: [USER_PROFILE_CACHE_REPOSITORY, USER_TOKEN_VERSION_CACHE_REPOSITORY],
})
export class RepositoryRedisModule {}
