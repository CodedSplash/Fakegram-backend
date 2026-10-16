import {
  detailedInfoErrorExample,
  validationErrorExample,
} from '@presentation/utils/examplesErrors.util';
import { manyExamples } from '@presentation/utils/manyExamples.util';
import { ValidationErrorResponseType } from '@presentation/types/validationErrorResponse.type';
import { DetailedInfoErrorResponseType } from '@presentation/types/DetailedInfoErrorResponse.type';

export const followListPathExample = (list: 'followers' | 'followings') =>
  `/user/xmf1qdx7slcpic0nqhjufpuh/${list}?limit=20`;

export const followListResponseExample = {
  items: [
    {
      id: 'wb460q9wa4qkxchewyn5muva',
      username: 'test_1',
      displayName: 'Test User',
      profilePhotoUrl: null,
      isVerified: false,
      followedAt: '2026-10-15T12:00:00.000Z',
    },
  ],
  nextCursor:
    'MjAyNi0xMC0xNVQxMjowMDowMC4wMDBafGNtZ3MxZjBsdzAwMDAwOGw0Zjl4Mmgza3E',
};

export const followListBadRequestExample = (list: 'followers' | 'followings') =>
  manyExamples({
    'application/json': {
      validationDataErrorExample: {
        type: ValidationErrorResponseType,
        summary: 'Ошибка при валидации данных',
        value: validationErrorExample(
          400,
          [
            'The Cuid has an incorrect format.',
            'Значение поля limit должно быть не больше 100',
          ],
          'Bad Request',
          followListPathExample(list),
        ),
      },
      invalidCursorExample: {
        type: DetailedInfoErrorResponseType,
        summary: 'Некорректный курсор пагинации',
        value: detailedInfoErrorExample(
          400,
          'Некорректный курсор пагинации.',
          'Bad Request',
          `${followListPathExample(list)}&cursor=abc`,
        ),
      },
    },
  });

export const followListNotFoundExample = (list: 'followers' | 'followings') =>
  detailedInfoErrorExample(
    404,
    'Пользователь не найден!',
    'Not Found',
    followListPathExample(list),
  );

export const followListForbiddenExample = (list: 'followers' | 'followings') =>
  detailedInfoErrorExample(
    403,
    'Это закрытый аккаунт.',
    'Forbidden',
    followListPathExample(list),
  );
