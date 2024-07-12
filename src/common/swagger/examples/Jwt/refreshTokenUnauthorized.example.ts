import { getSchemaPath } from '@nestjs/swagger';
import { DefaultErrorResponseType } from '../../../types/defaultErrorResponse.type';

export const refreshTokenAuthorizationErrorExample = {
  summary: 'Ошибка авторизации!',
  value: {
    status: 401,
    error: {
      message: 'Ошибка авторизации!',
      error: 'Unauthorized',
      statusCode: 401,
    },
    path: '/jwt_token/refresh_token/',
  },
};

export const refreshTokenNotDetectedExample = {
  summary: 'Токен не обнаружен!',
  value: {
    status: 401,
    error: {
      message: 'Токен не обнаружен!',
      error: 'Unauthorized',
      statusCode: 401,
    },
    path: '/jwt_token/refresh_token/',
  },
};

export const refreshTokenUnauthorized = {
  'application/json': {
    schema: {
      oneOf: [
        { $ref: getSchemaPath(DefaultErrorResponseType) },
        { $ref: getSchemaPath(DefaultErrorResponseType) },
      ],
    },
    examples: {
      refreshTokenAuthorizationErrorExample,
      refreshTokenNotDetectedExample,
    },
  },
};
