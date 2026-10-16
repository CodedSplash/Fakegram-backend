import {
  detailedInfoErrorExample,
  validationErrorExample,
} from '@presentation/utils/examplesErrors.util';
import { manyExamples } from '@presentation/utils/manyExamples.util';
import { ValidationErrorResponseType } from '@presentation/types/validationErrorResponse.type';
import { DetailedInfoErrorResponseType } from '@presentation/types/DetailedInfoErrorResponse.type';
import { FollowRequestActionResultDto } from '@presentation/dtos/Follow/followRequestActionResult.dto';

export const followRequestListPathExample = '/user/me/follow_requests?limit=20';

export const followRequestActionPathExample = (action: 'accept' | 'reject') =>
  `/user/me/follow_requests/wb460q9wa4qkxchewyn5muva/${action}`;

export const cancelFollowRequestPathExample =
  '/user/follow_requests/xmf1qdx7slcpic0nqhjufpuh';

export const followRequestListResponseExample = {
  items: [
    {
      id: 'wb460q9wa4qkxchewyn5muva',
      username: 'test_1',
      displayName: 'Test User',
      profilePhotoUrl: null,
      isVerified: false,
      requestedAt: '2026-10-15T12:00:00.000Z',
    },
  ],
  nextCursor:
    'MjAyNi0xMC0xNVQxMjowMDowMC4wMDBafGNtZ3MxZjBsdzAwMDAwOGw0Zjl4Mmgza3E',
};

export const followRequestListBadRequestExample = manyExamples({
  'application/json': {
    validationDataErrorExample: {
      type: ValidationErrorResponseType,
      summary: 'Ошибка при валидации данных',
      value: validationErrorExample(
        400,
        ['Значение поля limit должно быть не больше 100'],
        'Bad Request',
        followRequestListPathExample,
      ),
    },
    invalidCursorExample: {
      type: DetailedInfoErrorResponseType,
      summary: 'Некорректный курсор пагинации',
      value: detailedInfoErrorExample(
        400,
        'Некорректный курсор пагинации.',
        'Bad Request',
        `${followRequestListPathExample}&cursor=abc`,
      ),
    },
  },
});

export const followRequestSuccessExample = (
  message: string,
): FollowRequestActionResultDto => ({
  isSuccess: true,
  message,
});

export const followRequestBadRequestExample = (path: string) =>
  validationErrorExample(
    400,
    ['The Cuid has an incorrect format.'],
    'Bad Request',
    path,
  );

export const followRequestNotFoundExample = (path: string) =>
  detailedInfoErrorExample(
    404,
    'Запрос на подписку не найден.',
    'Not Found',
    path,
  );
