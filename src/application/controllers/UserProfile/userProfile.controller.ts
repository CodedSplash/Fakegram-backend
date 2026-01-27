import { Controller, Get, Param } from '@nestjs/common';
import {
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import { Public } from '@application/decorators/isPublic.decorator';
import { HasUserResponseDto } from '@application/dtos/UserProfile/hasUserResponse.dto';
import { internalServerErrorExample } from '@application/swagger/examples/general/internalServerError.example';
import { throttlerExceptionExample } from '@application/swagger/examples/general/throttlerException.example';
import { hasUserNotFoundExample } from '@application/swagger/examples/UserProfile/hasUserNotFound.example';
import { hasUserResponseExample } from '@application/swagger/examples/UserProfile/hasUserResponse.example';
import { DefaultErrorResponseType } from '@application/types/defaultErrorResponse.type';
import { DetailedInfoErrorResponseType } from '@application/types/DetailedInfoErrorResponse.type';
import { HasUserUseCase } from '@src/use-cases/UserProfile/hasUser.use-case';

@Controller('user')
@ApiTags('User profile')
export class UserProfileController {
  constructor(private readonly hasUserUseCase: HasUserUseCase) {}

  @Public()
  @Get('has_user/:username')
  @ApiOkResponse({
    description: 'Пользователь найден!',
    type: HasUserResponseDto,
    example: hasUserResponseExample,
  })
  @ApiNotFoundResponse({
    description: 'Пользователь не найден!',
    type: DetailedInfoErrorResponseType,
    example: hasUserNotFoundExample,
  })
  @ApiTooManyRequestsResponse({
    description: 'Слишком много запросов!',
    type: DefaultErrorResponseType,
    example: throttlerExceptionExample('/user/has_user/test_1'),
  })
  @ApiInternalServerErrorResponse({
    description: 'Ошибка на стороне сервера!',
    type: DetailedInfoErrorResponseType,
    example: internalServerErrorExample('/user/has_user/test_1'),
  })
  async hasUser(@Param('username') username: string) {
    const user = await this.hasUserUseCase.execute(username);

    return new HasUserResponseDto(user);
  }
}
