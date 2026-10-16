import { User } from '@domain/User/entities/user.entity';
import { AuthorizationError } from '@domain/Jwt/errors/jwt.errors';
import { UserIdVO } from '@domain/User/value-objects/userId.vo';
import { InvalidCurrentPasswordError } from '@domain/User/errors/user.errors';
import { IUserDbRepository } from '@domain/User/repositories/user.db.repository.inter';
import { IPasswordHasher } from '@domain/User/services/passwordHasher.inter';

// Изменение учётных данных требует повторного ввода текущего пароля
export const findUserByCurrentPassword = async (
  userDbRepository: IUserDbRepository,
  passwordHasher: IPasswordHasher,
  userId: string,
  currentPassword: string,
): Promise<User> => {
  const user = await userDbRepository.findById(new UserIdVO(userId));

  if (!user || !user.isActive) {
    throw new AuthorizationError();
  }

  if (!(await passwordHasher.verify(currentPassword, user.passwordHash))) {
    throw new InvalidCurrentPasswordError();
  }

  return user;
};
