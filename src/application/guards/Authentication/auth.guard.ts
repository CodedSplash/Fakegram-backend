import {
  CanActivate,
  ExecutionContext,
  Inject,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../../../common/decorators/isPublic.decorator';
import { JwtTokenService } from '../../../core/Jwt/servicies/jwtToken.service';
import { IJwtTokenService } from '../../../core/Jwt/servicies/jwtToken.service.interface';

export class AuthGuard implements CanActivate {
  constructor(
    @Inject(JwtTokenService) private readonly jwtTokenService: IJwtTokenService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) throw new UnauthorizedException('Токен не найден!');

    try {
      request['user'] = this.jwtTokenService.validateAccessToken(token);
    } catch {
      throw new UnauthorizedException('Токен не валиден!');
    }

    return true;
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];

    return type === 'Bearer' ? token : undefined;
  }
}
