export const throttlerExceptionExample = (path: string) => {
  return {
    status: 429,
    error: 'ThrottlerException: Too Many Requests',
    path,
  };
};
