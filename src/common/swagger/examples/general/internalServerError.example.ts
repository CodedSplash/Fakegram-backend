export const internalServerErrorExample = (path: string) => {
  return {
    status: 500,
    error: {
      message: 'Ошибка на стороне сервера',
      error: 'Internal Server Error',
      statusCode: 500,
    },
    path,
  };
};
