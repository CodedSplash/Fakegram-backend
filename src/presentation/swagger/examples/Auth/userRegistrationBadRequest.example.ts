import { DetailedInfoErrorResponseType } from '@presentation/types/DetailedInfoErrorResponse.type';
import { ValidationErrorResponseType } from '@presentation/types/validationErrorResponse.type';
import {
  detailedInfoErrorExample,
  validationErrorExample,
} from '@presentation/utils/examplesErrors.util';
import { manyExamples } from '@presentation/utils/manyExamples.util';

const userAlreadyRegisteredExample = {
  type: DetailedInfoErrorResponseType,
  summary: 'Пользователь уже зарегистрирован',
  value: detailedInfoErrorExample(
    400,
    'Пользователь уже зарегистрирован',
    'Bad Request',
    '/auth/registration/',
  ),
};
const validationDataErrorExample = {
  type: ValidationErrorResponseType,
  summary: 'Ошибка при валидации данных',
  value: validationErrorExample(
    400,
    ['Минимальная длина поля username должна составлять не менее 6 символов'],
    'Bad Request',
    '/auth/registration/',
  ),
};

export const userRegistrationBadRequestExample = manyExamples({
  'application/json': {
    userAlreadyRegisteredExample,
    validationDataErrorExample,
  },
});
