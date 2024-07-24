export const generateMinLengthMessage = (field: string, minLength: number) =>
  `Минимальная длина поля ${field} должна составлять не менее ${minLength} символов`;

export const generateMaxLengthMessage = (field: string, maxLength: number) =>
  `Максимальная длина поля ${field} должна составлять не более ${maxLength} символов`;

export const fieldNotEmptyMessage = (field: string) =>
  `Поле ${field} не должно быть пустым`;

export const fieldTypeMessage = (field: string, type: string) =>
  `Поле ${field} должно быть ${type}`;
