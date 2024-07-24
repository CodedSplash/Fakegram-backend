import { DefaultErrorResponseType } from '../types/defaultErrorResponse.type';
import { DetailedInfoErrorResponseType } from '../types/DetailedInfoErrorResponse.type';
import { ValidationErrorResponseType } from '../types/validationErrorResponse.type';

export const defaultErrorExample = (
  status: number,
  error: string,
  path: string,
): DefaultErrorResponseType => {
  return {
    status,
    error,
    path,
  };
};

export const detailedInfoErrorExample = (
  status: number,
  message: string,
  typeError: string,
  path: string,
): DetailedInfoErrorResponseType => {
  return {
    status,
    error: {
      statusCode: status,
      message,
      error: typeError,
    },
    path,
  };
};

export const validationErrorExample = (
  status: number,
  messages: string[],
  typeError: string,
  path: string,
): ValidationErrorResponseType => {
  return {
    status,
    error: {
      statusCode: status,
      message: messages,
      error: typeError,
    },
    path,
  };
};
