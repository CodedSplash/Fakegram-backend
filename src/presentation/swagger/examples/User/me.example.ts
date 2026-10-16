import {
  detailedInfoErrorExample,
  validationErrorExample,
} from '@presentation/utils/examplesErrors.util';
import { manyExamples } from '@presentation/utils/manyExamples.util';
import { ValidationErrorResponseType } from '@presentation/types/validationErrorResponse.type';
import { DetailedInfoErrorResponseType } from '@presentation/types/DetailedInfoErrorResponse.type';
import { userProfileResponseExample } from '@presentation/swagger/examples/User/userProfile.example';

export const mePathExample = '/user/me';

export const ownProfileResponseExample = {
  ...userProfileResponseExample,
  email: 'test_1@example.com',
  phoneNumber: '79991234567',
  dateOfBirth: '2000-05-20T00:00:00.000Z',
  gender: 'PREFER_NOT_TO_SAY',
  emailVerified: false,
  lastLoginAt: '2026-10-15T09:30:00.000Z',
};

export const updateMyProfileRequestExample = {
  displayName: 'Test User',
  bio: 'Пишу код и фотографирую закаты.',
  websiteUrl: 'https://example.com',
  gender: 'PREFER_NOT_TO_SAY',
  isPrivate: false,
};

// Токен валиден, но пользователя из него уже нет.
export const meUnauthorizedExample = detailedInfoErrorExample(
  401,
  'Ошибка авторизации!',
  'Unauthorized',
  mePathExample,
);

export const updateMyProfileBadRequestExample = manyExamples({
  'application/json': {
    validationDataErrorExample: {
      type: ValidationErrorResponseType,
      summary: 'Ошибка при валидации данных',
      value: validationErrorExample(
        400,
        [
          'Максимальная длина поля displayName должна составлять не более 30 символов',
          'Поле websiteUrl должно быть ссылкой http(s)',
        ],
        'Bad Request',
        mePathExample,
      ),
    },
    emptyBodyExample: {
      type: DetailedInfoErrorResponseType,
      summary: 'Пустое тело запроса',
      value: detailedInfoErrorExample(
        400,
        'Не переданы поля для изменения профиля.',
        'Bad Request',
        mePathExample,
      ),
    },
  },
});
