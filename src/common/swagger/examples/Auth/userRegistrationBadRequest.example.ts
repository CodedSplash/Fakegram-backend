import { getSchemaPath } from '@nestjs/swagger';

import { DetailedInfoErrorResponseType } from '../../../types/DetailedInfoErrorResponse.type';
import { ValidationErrorResponseType } from '../../../types/validationErrorResponse.type';

const userAlreadyRegisteredExample = {
  summary: 'Пользователь уже зарегистрирован',
  value: {
    status: 400,
    error: {
      message: 'Пользователь уже зарегистрирован',
      error: 'Bad Request',
      statusCode: 400,
    },
    path: '/auth/registration/',
  },
};

const validationErrorExample = {
  summary: 'Ошибка при валидации данных',
  value: {
    status: 400,
    error: {
      message: [
        'Минимальная длина поля username должна составлять не менее 6 символов',
      ],
      error: 'Bad Request',
      statusCode: 400,
    },
    path: '/auth/registration/',
  },
};

export const userRegistrationBadRequestExample = {
  'application/json': {
    schema: {
      oneOf: [
        { $ref: getSchemaPath(DetailedInfoErrorResponseType) },
        { $ref: getSchemaPath(ValidationErrorResponseType) },
      ],
    },
    examples: {
      userAlreadyRegisteredExample,
      validationErrorExample,
    },
  },
};
