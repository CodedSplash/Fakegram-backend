import {
  detailedInfoErrorExample,
  validationErrorExample,
} from '@presentation/utils/examplesErrors.util';
import { manyExamples } from '@presentation/utils/manyExamples.util';
import { ValidationErrorResponseType } from '@presentation/types/validationErrorResponse.type';
import { DetailedInfoErrorResponseType } from '@presentation/types/DetailedInfoErrorResponse.type';
import { BlockActionResultDto } from '@presentation/dtos/Block/blockActionResult.dto';

export const blockPathExample = '/user/xmf1qdx7slcpic0nqhjufpuh/block';

export const blockListPathExample = '/user/me/blocks?limit=20';

export const blockSuccessExample: BlockActionResultDto = {
  isSuccess: true,
  message: 'Пользователь заблокирован.',
};

export const unblockSuccessExample: BlockActionResultDto = {
  isSuccess: true,
  message: 'Пользователь разблокирован.',
};

export const blockListResponseExample = {
  items: [
    {
      id: 'xmf1qdx7slcpic0nqhjufpuh',
      username: 'test_2',
      displayName: 'Test User',
      profilePhotoUrl: null,
      isVerified: false,
      blockedAt: '2026-10-15T12:00:00.000Z',
    },
  ],
  nextCursor:
    'MjAyNi0xMC0xNVQxMjowMDowMC4wMDBafHhtZjFxZHg3c2xjcGljMG5xaGp1ZnB1aA',
};

export const blockBadRequestExample = manyExamples({
  'application/json': {
    selfBlockExample: {
      type: DetailedInfoErrorResponseType,
      summary: 'Нельзя заблокировать самого себя',
      value: detailedInfoErrorExample(
        400,
        'Нельзя заблокировать самого себя.',
        'Bad Request',
        blockPathExample,
      ),
    },
    validationDataErrorExample: {
      type: ValidationErrorResponseType,
      summary: 'Ошибка при валидации данных',
      value: validationErrorExample(
        400,
        ['The Cuid has an incorrect format.'],
        'Bad Request',
        '/user/123/block',
      ),
    },
  },
});

export const unblockBadRequestExample = validationErrorExample(
  400,
  ['The Cuid has an incorrect format.'],
  'Bad Request',
  '/user/123/block',
);

export const blockNotFoundExample = detailedInfoErrorExample(
  404,
  'Пользователь не найден!',
  'Not Found',
  blockPathExample,
);

export const unblockNotFoundExample = detailedInfoErrorExample(
  404,
  'Пользователь не заблокирован.',
  'Not Found',
  blockPathExample,
);

export const blockConflictExample = detailedInfoErrorExample(
  409,
  'Пользователь уже заблокирован.',
  'Conflict',
  blockPathExample,
);

export const blockListBadRequestExample = manyExamples({
  'application/json': {
    validationDataErrorExample: {
      type: ValidationErrorResponseType,
      summary: 'Ошибка при валидации данных',
      value: validationErrorExample(
        400,
        ['Значение поля limit должно быть не больше 100'],
        'Bad Request',
        blockListPathExample,
      ),
    },
    invalidCursorExample: {
      type: DetailedInfoErrorResponseType,
      summary: 'Некорректный курсор пагинации',
      value: detailedInfoErrorExample(
        400,
        'Некорректный курсор пагинации.',
        'Bad Request',
        `${blockListPathExample}&cursor=abc`,
      ),
    },
  },
});
