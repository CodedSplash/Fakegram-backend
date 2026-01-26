import { defaultErrorExample } from '@application/utils/examplesErrors.util';

export const throttlerExceptionExample = (path: string) => {
  return defaultErrorExample(
    429,
    'ThrottlerException: Too Many Requests',
    path,
  );
};
