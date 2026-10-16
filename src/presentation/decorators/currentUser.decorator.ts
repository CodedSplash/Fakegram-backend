import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IJwtTokenPayload } from '@domain/Jwt/types/jwtTokenPayload.interface';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): IJwtTokenPayload =>
    context.switchToHttp().getRequest()['user'],
);
