import {
  detailedInfoErrorExample,
  validationErrorExample,
} from '@presentation/utils/examplesErrors.util';
import { manyExamples } from '@presentation/utils/manyExamples.util';
import { ValidationErrorResponseType } from '@presentation/types/validationErrorResponse.type';
import { DetailedInfoErrorResponseType } from '@presentation/types/DetailedInfoErrorResponse.type';

const selfFollowExample = {
  type: DetailedInfoErrorResponseType,
  summary: 'Нельзя подписаться на самого себя',
  value: detailedInfoErrorExample(
    400,
    'Нельзя подписаться на самого себя.',
    'Bad Request',
    '/user/follow',
  ),
};
const validationDataErrorExample = {
  type: ValidationErrorResponseType,
  summary: 'Ошибка при валидации данных',
  value: validationErrorExample(
    400,
    ['Поле followingId не должно быть пустым'],
    'Bad Request',
    '/user/follow',
  ),
};

export const FollowBadRequestExample = manyExamples({
  'application/json': {
    selfFollowExample,
    validationDataErrorExample,
  },
});

export const followNotFoundExample = detailedInfoErrorExample(
  404,
  'Пользователь не найден!',
  'Not Found',
  '/user/follow',
);

export const followConflictExample = detailedInfoErrorExample(
  409,
  'Вы уже подписаны на данного пользователя.',
  'Conflict',
  '/user/follow',
);

export const followConflictExamples = manyExamples({
  'application/json': {
    alreadyFollowingExample: {
      type: DetailedInfoErrorResponseType,
      summary: 'Подписка уже существует',
      value: followConflictExample,
    },
    alreadyRequestedExample: {
      type: DetailedInfoErrorResponseType,
      summary: 'Запрос на подписку уже отправлен',
      value: detailedInfoErrorExample(
        409,
        'Запрос на подписку уже отправлен.',
        'Conflict',
        '/user/follow',
      ),
    },
  },
});

export const followForbiddenExample = detailedInfoErrorExample(
  403,
  'Действие недоступно.',
  'Forbidden',
  '/user/follow',
);
