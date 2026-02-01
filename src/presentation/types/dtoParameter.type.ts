export type GenerateDtoParameterType<T> = {
  [K in keyof T]: T[K];
};
