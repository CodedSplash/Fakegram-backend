import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { IsOlderThan } from '../../../common/decorators/isOlderThan.decorator';

const MIN_NAME_LENGTH = 2;
const MAX_NAME_LENGTH = 50;
const MIN_USERNAME_LENGTH = 6;
const MAX_USERNAME_LENGTH = 20;
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 15;
const MIN_AGE = 13;

export class UserRegistrationDto {
  @IsOptional()
  @IsString({ message: 'Поле name должно быть строкой' })
  @MinLength(MIN_NAME_LENGTH, {
    message: `Минимальная длина поля name должна составлять не менее ${MIN_NAME_LENGTH} символов`,
  })
  @MaxLength(MAX_NAME_LENGTH, {
    message: `Максимальная длина поля name должна составлять не более ${MAX_NAME_LENGTH} символов`,
  })
  readonly name?: string;

  @IsNotEmpty({ message: 'Поле username не должно быть пустым' })
  @IsString({ message: 'Поле username должно быть строкой' })
  @MinLength(MIN_USERNAME_LENGTH, {
    message: `Минимальная длина поля username должна составлять не менее ${MIN_USERNAME_LENGTH} символов`,
  })
  @MaxLength(MAX_USERNAME_LENGTH, {
    message: `Максимальная длина поля username должна составлять не более ${MAX_USERNAME_LENGTH} символов`,
  })
  readonly username: string;

  @IsNotEmpty({ message: 'Поле email не должно быть пустым' })
  @IsEmail({}, { message: 'Поле email должно быть почтой' })
  readonly email: string;

  @IsNotEmpty({ message: 'Поле password не должно быть пустым' })
  @IsString({ message: 'Поле password должно быть строкой' })
  @MinLength(MIN_PASSWORD_LENGTH, {
    message: `Минимальная длина поля password должна составлять не менее ${MIN_PASSWORD_LENGTH} символов`,
  })
  @MaxLength(MAX_PASSWORD_LENGTH, {
    message: `Максимальная длина поля password должна составлять не более ${MAX_PASSWORD_LENGTH} символов`,
  })
  readonly password: string;

  @IsNotEmpty({ message: 'Поле fullDateBirth не должно быть пустым' })
  @IsDateString(
    {},
    {
      message: 'Поле fullDateBirth должно быть строковой датой формата ISO8601',
    },
  )
  @IsOlderThan(MIN_AGE, {
    message: `Пользователю должно быть не менее ${MIN_AGE} лет`,
  })
  readonly fullDateBirth: string;
}
