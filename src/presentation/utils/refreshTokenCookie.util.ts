import { CookieOptions, Response } from 'express';
import { ConfigService } from '@nestjs/config';

export const REFRESH_TOKEN_COOKIE_NAME = 'refreshToken';

const REFRESH_TOKEN_COOKIE_MAX_AGE = 30 * 24 * 60 * 60 * 1000;

// Cookie нужен только эндпоинтам /jwt/*
const REFRESH_TOKEN_COOKIE_PATH = '/jwt';

const refreshTokenCookieOptions = (
  configService: ConfigService,
): CookieOptions => ({
  httpOnly: true,
  sameSite: 'strict',
  // Режим окружения проекта — MODE_ENV; secure везде, кроме локальной разработки по http
  secure: configService.get('MODE_ENV') !== 'dev',
  path: REFRESH_TOKEN_COOKIE_PATH,
});

export const setRefreshTokenCookie = (
  res: Response,
  refreshToken: string,
  configService: ConfigService,
): void => {
  res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
    ...refreshTokenCookieOptions(configService),
    maxAge: REFRESH_TOKEN_COOKIE_MAX_AGE,
  });
};

// Для удаления cookie атрибуты (path, sameSite, secure) должны совпадать
export const clearRefreshTokenCookie = (
  res: Response,
  configService: ConfigService,
): void => {
  res.clearCookie(
    REFRESH_TOKEN_COOKIE_NAME,
    refreshTokenCookieOptions(configService),
  );
};
