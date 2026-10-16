import {
  detailedInfoErrorExample,
  validationErrorExample,
} from '@presentation/utils/examplesErrors.util';
import { manyExamples } from '@presentation/utils/manyExamples.util';
import { ValidationErrorResponseType } from '@presentation/types/validationErrorResponse.type';
import { DetailedInfoErrorResponseType } from '@presentation/types/DetailedInfoErrorResponse.type';

export const changePasswordPathExample = '/user/me/password';
export const changeUsernamePathExample = '/user/me/username';
export const changeEmailPathExample = '/user/me/email';
export const deleteAccountPathExample = '/user/me';
export const deactivateAccountPathExample = '/user/me/deactivate';

export const changePasswordRequestExample = {
  currentPassword: 'username123',
  newPassword: 'newPassword1',
};

export const changeUsernameRequestExample = {
  username: 'new_username',
  currentPassword: 'username123',
};

export const changeEmailRequestExample = {
  email: 'new@example.com',
  currentPassword: 'username123',
};

export const changeEmailResponseExample = {
  email: 'new@example.com',
  emailVerified: false,
};

const validationBadRequest = (path: string, messages: string[]) => ({
  type: ValidationErrorResponseType,
  summary: 'Ошибка при валидации данных',
  value: validationErrorExample(400, messages, 'Bad Request', path),
});

const sameValueBadRequest = (path: string, message: string) => ({
  type: DetailedInfoErrorResponseType,
  summary: 'Новое значение совпадает с текущим',
  value: detailedInfoErrorExample(400, message, 'Bad Request', path),
});

const accountUnauthorized = (path: string) =>
  manyExamples({
    'application/json': {
      invalidCurrentPasswordExample: {
        type: DetailedInfoErrorResponseType,
        summary: 'Неверный текущий пароль',
        value: detailedInfoErrorExample(
          401,
          'Текущий пароль введён неверно!',
          'Unauthorized',
          path,
        ),
      },
      authorizationErrorExample: {
        type: DetailedInfoErrorResponseType,
        summary: 'Пользователь не авторизован или не существует',
        value: detailedInfoErrorExample(
          401,
          'Ошибка авторизации!',
          'Unauthorized',
          path,
        ),
      },
    },
  });

export const changePasswordBadRequestExample = manyExamples({
  'application/json': {
    validationDataErrorExample: validationBadRequest(
      changePasswordPathExample,
      [
        'Минимальная длина поля newPassword должна составлять не менее 8 символов',
      ],
    ),
    samePasswordExample: sameValueBadRequest(
      changePasswordPathExample,
      'Новый пароль должен отличаться от текущего.',
    ),
  },
});

export const changeUsernameBadRequestExample = manyExamples({
  'application/json': {
    validationDataErrorExample: validationBadRequest(
      changeUsernamePathExample,
      ['Минимальная длина поля username должна составлять не менее 6 символов'],
    ),
    sameUsernameExample: sameValueBadRequest(
      changeUsernamePathExample,
      'Новый username совпадает с текущим.',
    ),
  },
});

export const changeEmailBadRequestExample = manyExamples({
  'application/json': {
    validationDataErrorExample: validationBadRequest(changeEmailPathExample, [
      'Поле email должно быть почтой',
    ]),
    sameEmailExample: sameValueBadRequest(
      changeEmailPathExample,
      'Новый email совпадает с текущим.',
    ),
  },
});

export const changePasswordUnauthorizedExample = accountUnauthorized(
  changePasswordPathExample,
);
export const changeUsernameUnauthorizedExample = accountUnauthorized(
  changeUsernamePathExample,
);
export const changeEmailUnauthorizedExample = accountUnauthorized(
  changeEmailPathExample,
);

export const changeUsernameConflictExample = detailedInfoErrorExample(
  409,
  'Этот username уже занят.',
  'Conflict',
  changeUsernamePathExample,
);

export const changeEmailConflictExample = detailedInfoErrorExample(
  409,
  'Этот email уже используется.',
  'Conflict',
  changeEmailPathExample,
);

export const deleteAccountUnauthorizedExample = accountUnauthorized(
  deleteAccountPathExample,
);

export const deleteAccountBadRequestExample = validationErrorExample(
  400,
  ['Поле currentPassword не должно быть пустым'],
  'Bad Request',
  deleteAccountPathExample,
);

export const deactivateAccountUnauthorizedExample = accountUnauthorized(
  deactivateAccountPathExample,
);

export const deactivateAccountBadRequestExample = validationErrorExample(
  400,
  ['Поле currentPassword не должно быть пустым'],
  'Bad Request',
  deactivateAccountPathExample,
);
