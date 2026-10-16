import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '@presentation/decorators/isPublic.decorator';
import { ValidateAccessTokenUseCase } from '@application/Jwt/validateAccessToken.use-case';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly validateAccessTokenUseCase: ValidateAccessTokenUseCase,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Токен не найден!');
    }

    // Подпись, версия токена и активность пользователя; невалидный или
    // отозванный токен — InvalidAccessTokenError (401 через ErrorHandlerFilter)
    request['user'] = await this.validateAccessTokenUseCase.execute(token);

    return true;
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];

    return type === 'Bearer' ? token : undefined;
  }
}
