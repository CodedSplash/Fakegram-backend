import { verify } from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { IJwtTokenPayload } from '@domain/Jwt/types/jwtTokenPayload.interface';
import { InvalidAccessTokenError } from '@domain/Jwt/errors/jwt.errors';
import { UserIdVO } from '@domain/User/value-objects/userId.vo';
import { INITIAL_TOKEN_VERSION } from '@domain/User/types/userSessionState.type';
import { UserTokenVersionService } from '@application/Jwt/services/userTokenVersion.service';

@Injectable()
export class ValidateAccessTokenUseCase {
  constructor(
    private readonly userTokenVersionService: UserTokenVersionService,
    private readonly configService: ConfigService,
  ) {}

  // Подпись + актуальность: версия токена должна совпадать с текущей версией
  // активного пользователя (смена пароля/username, logout отзывают токены)
  async execute(token: string): Promise<IJwtTokenPayload> {
    let payload: IJwtTokenPayload;

    try {
      payload = verify(token, this.configService.get('SECRET_ACCESS_JWT_KEY'), {
        algorithms: ['HS256'],
      }) as IJwtTokenPayload;
    } catch {
      throw new InvalidAccessTokenError();
    }

    if (
      typeof payload?.id !== 'string' ||
      !payload.id ||
      (payload.tv !== undefined && !Number.isInteger(payload.tv))
    ) {
      throw new InvalidAccessTokenError();
    }

    // Токены, выданные до появления версии, не содержат tv — считаем их
    // версией 0, они работают до истечения срока или первого отзыва
    const tokenVersion = payload.tv ?? INITIAL_TOKEN_VERSION;

    const currentVersion = await this.userTokenVersionService.getCurrent(
      new UserIdVO(payload.id),
    );

    if (currentVersion === null || currentVersion !== tokenVersion) {
      throw new InvalidAccessTokenError();
    }

    return payload;
  }
}
