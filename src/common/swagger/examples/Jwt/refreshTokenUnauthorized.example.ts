import { DetailedInfoErrorResponseType } from '../../../types/DetailedInfoErrorResponse.type';
import { detailedInfoErrorExample } from '../../../utils/examplesErrors.util';
import { manyExamples } from '../../../utils/manyExamples.util';

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
