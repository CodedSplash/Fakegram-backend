import { Controller, Get, Param } from '@nestjs/common';
import {
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import { Public } from '@presentation/decorators/isPublic.decorator';
import { HasUserResponseDto } from '@presentation/dtos/UserProfile/hasUserResponse.dto';
import { internalServerErrorExample } from '@presentation/swagger/examples/general/internalServerError.example';
import { throttlerExceptionExample } from '@presentation/swagger/examples/general/throttlerException.example';
import { hasUserNotFoundExample } from '@presentation/swagger/examples/UserProfile/hasUserNotFound.example';
import { hasUserResponseExample } from '@presentation/swagger/examples/UserProfile/hasUserResponse.example';
import { DefaultErrorResponseType } from '@presentation/types/defaultErrorResponse.type';
import { DetailedInfoErrorResponseType } from '@presentation/types/DetailedInfoErrorResponse.type';
import { HasUserUseCase } from '@application/UserProfile/hasUser.use-case';

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
