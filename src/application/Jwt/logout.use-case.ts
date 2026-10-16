import { Injectable } from '@nestjs/common';
import { UserIdVO } from '@domain/User/value-objects/userId.vo';
import { UsernameVO } from '@domain/User/value-objects/username.vo';
import { RevokeUserSessionsService } from '@application/Jwt/services/revokeUserSessions.service';

@Injectable()
export class LogoutUseCase {
  constructor(
    private readonly revokeUserSessionsService: RevokeUserSessionsService,
  ) {}

  async execute(userId: string, username: string): Promise<void> {
    // Сессия у пользователя одна: удаляем refresh токен и отзываем
    // текущий access токен (инкремент версии)
    await this.revokeUserSessionsService.revokeAll({
      id: new UserIdVO(userId),
      username: new UsernameVO(username),
    });
  }
}
