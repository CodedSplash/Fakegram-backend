import { DetailedInfoErrorResponseType } from '@application/types/DetailedInfoErrorResponse.type';
import { detailedInfoErrorExample } from '@application/utils/examplesErrors.util';
import { manyExamples } from '@application/utils/manyExamples.util';

export const refreshTokenAuthorizationErrorExample = {
  type: DetailedInfoErrorResponseType,
  summary: 'Ошибка авторизации!',
  value: detailedInfoErrorExample(
    401,
    'Ошибка авторизации!',
    'Unauthorized',
    '/jwt_token/refresh_token/',
  ),
};

export const refreshTokenNotDetectedExample = {
  type: DetailedInfoErrorResponseType,
  summary: 'Токен не обнаружен!',
  value: detailedInfoErrorExample(
    401,
    'Токен не обнаружен!',
    'Unauthorized',
    '/jwt_token/refresh_token/',
  ),
};

export const refreshTokenUnauthorized = manyExamples({
  'application/json': {
    refreshTokenAuthorizationErrorExample,
    refreshTokenNotDetectedExample,
  },
});
