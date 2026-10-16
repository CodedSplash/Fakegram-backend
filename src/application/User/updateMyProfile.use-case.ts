import { Inject, Injectable, Logger } from '@nestjs/common';
import { ValidationError } from '@domain/common/errors/domain.error';
import { AuthorizationError } from '@domain/Jwt/errors/jwt.errors';
import { UserIdVO } from '@domain/User/value-objects/userId.vo';
import { OwnProfileOutputDto } from '@application/User/dtos/ownProfile.output.dto';
import { UpdateMyProfileInputDto } from '@application/User/dtos/updateMyProfile.input.dto';
import { toOwnProfile } from '@application/User/utils/userProfile.util';
import { AcceptAllFollowRequestsUseCase } from '@application/Follow/acceptAllFollowRequests.use-case';
import {
  IUserDbRepository,
  USER_DB_REPOSITORY,
} from '@domain/User/repositories/user.db.repository.inter';
import {
  IUserProfileCacheRepository,
  USER_PROFILE_CACHE_REPOSITORY,
} from '@domain/User/repositories/userProfile.cache.repository.inter';

@Injectable()
export class UpdateMyProfileUseCase {
  private readonly logger = new Logger(UpdateMyProfileUseCase.name);

  constructor(
    @Inject(USER_DB_REPOSITORY)
    private readonly userDbRepository: IUserDbRepository,
    @Inject(USER_PROFILE_CACHE_REPOSITORY)
    private readonly userProfileCacheRepository: IUserProfileCacheRepository,
    private readonly acceptAllFollowRequestsUseCase: AcceptAllFollowRequestsUseCase,
  ) {}

  async execute(
    userId: string,
    dto: UpdateMyProfileInputDto,
  ): Promise<OwnProfileOutputDto> {
    const { displayName, bio, websiteUrl, gender, isPrivate } = dto;

    if (
      [displayName, bio, websiteUrl, gender, isPrivate].every(
        (value) => value === undefined,
      )
    ) {
      throw new ValidationError('Не переданы поля для изменения профиля.');
    }

    const userIdVO = new UserIdVO(userId);
    const user = await this.userDbRepository.findById(userIdVO);

    if (!user || !user.isActive) {
      throw new AuthorizationError();
    }

    const wasPrivate = user.isPrivate;

    if (displayName !== undefined) user.changeDisplayName(displayName);
    if (bio !== undefined) user.changeBio(bio);
    if (websiteUrl !== undefined) user.changeWebsiteUrl(websiteUrl);
    if (gender !== undefined) user.changeGender(gender);
    if (isPrivate !== undefined) {
      if (isPrivate) user.privateProfile();
      else user.publicProfile();
    }

    // Сущность провалидировала и нормализовала значения; пишем только
    // переданные поля, остальные колонки не трогаем
    const updatedUser = await this.userDbRepository.updateProfile(userIdVO, {
      displayName: displayName !== undefined ? user.displayName : undefined,
      bio: bio !== undefined ? user.bio : undefined,
      websiteUrl: websiteUrl !== undefined ? user.websiteUrl : undefined,
      gender,
      isPrivate: isPrivate !== undefined ? user.isPrivate : undefined,
    });

    // Инвалидация строго после записи в БД. Ошибку не пробрасываем: изменения
    // уже сохранены, устаревший публичный профиль доживёт до TTL.
    try {
      await this.userProfileCacheRepository.invalidate([userIdVO]);
    } catch (error: unknown) {
      this.logger.error(
        `Profile cache invalidation failed, stale until TTL for user: ${userId}`,
        error instanceof Error ? error.stack : String(error),
      );
    }

    // Открытый аккаунт не принимает заявок: ожидающие принимаются сразу.
    // Ошибку не пробрасываем — профиль уже сохранён, оставшиеся заявки владелец
    // примет вручную, а прямая подписка удаляет висящую заявку.
    if (wasPrivate && !updatedUser.isPrivate) {
      try {
        const accepted =
          await this.acceptAllFollowRequestsUseCase.execute(userId);
        if (accepted > 0) {
          this.logger.log(
            `Accepted ${accepted} pending follow request(s) of ${userId}`,
          );
        }
      } catch (error: unknown) {
        this.logger.error(
          `Accepting pending follow requests failed for user: ${userId}`,
          error instanceof Error ? error.stack : String(error),
        );
      }
    }

    return toOwnProfile(updatedUser);
  }
}
