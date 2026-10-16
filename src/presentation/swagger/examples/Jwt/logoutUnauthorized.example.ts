import { DetailedInfoErrorResponseType } from '@presentation/types/DetailedInfoErrorResponse.type';
import { detailedInfoErrorExample } from '@presentation/utils/examplesErrors.util';
import { manyExamples } from '@presentation/utils/manyExamples.util';

export const logoutTokenNotFoundExample = {
  type: DetailedInfoErrorResponseType,
  summary: 'Токен не найден!',
  value: detailedInfoErrorExample(
    401,
    'Токен не найден!',
    'Unauthorized',
    '/jwt/logout',
  ),
};

export const logoutTokenInvalidExample = {
  type: DetailedInfoErrorResponseType,
  summary: 'Токен не валиден!',
  value: detailedInfoErrorExample(
    401,
    'Токен не валиден!',
    'Unauthorized',
    '/jwt/logout',
  ),
};

export const logoutUnauthorized = manyExamples({
  'application/json': {
    logoutTokenNotFoundExample,
    logoutTokenInvalidExample,
  },
});
