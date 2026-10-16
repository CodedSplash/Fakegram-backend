import { Controller, Get, Param } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import { Public } from '@presentation/decorators/isPublic.decorator';
import { HasUserResponseDto } from '@presentation/dtos/User/hasUserResponse.dto';
import { UserProfileResponseDto } from '@presentation/dtos/User/userProfileResponse.dto';
import { internalServerErrorExample } from '@presentation/swagger/examples/general/internalServerError.example';
import { throttlerExceptionExample } from '@presentation/swagger/examples/general/throttlerException.example';
import { hasUserNotFoundExample } from '@presentation/swagger/examples/User/hasUserNotFound.example';
import { hasUserResponseExample } from '@presentation/swagger/examples/User/hasUserResponse.example';
import {
  userProfileBadRequestExample,
  userProfileNotFoundExample,
  userProfilePathExample,
  userProfileResponseExample,
} from '@presentation/swagger/examples/User/userProfile.example';
import { DefaultErrorResponseType } from '@presentation/types/defaultErrorResponse.type';
import { DetailedInfoErrorResponseType } from '@presentation/types/DetailedInfoErrorResponse.type';
import { HasUserUseCase } from '@application/User/hasUser.use-case';
import { GetUserProfileUseCase } from '@application/User/getUserProfile.use-case';

@Controller('user')
@ApiTags('User profile')
export class UserController {
  constructor(
    private readonly hasUserUseCase: HasUserUseCase,
    private readonly getUserProfileUseCase: GetUserProfileUseCase,
  ) {}

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

    return new HasUserResponseDto({ username: user.username.toString() });
  }

  @Public()
  @Get(':username/profile')
  @ApiOkResponse({
    description: 'Публичный профиль пользователя со счётчиками подписок.',
    type: UserProfileResponseDto,
    example: userProfileResponseExample,
  })
  @ApiBadRequestResponse({
    description: 'Некорректный username',
    type: DetailedInfoErrorResponseType,
    example: userProfileBadRequestExample,
  })
  @ApiNotFoundResponse({
    description: 'Пользователь не найден!',
    type: DetailedInfoErrorResponseType,
    example: userProfileNotFoundExample,
  })
  @ApiTooManyRequestsResponse({
    description: 'Слишком много запросов!',
    type: DefaultErrorResponseType,
    example: throttlerExceptionExample(userProfilePathExample),
  })
  @ApiInternalServerErrorResponse({
    description: 'Ошибка на стороне сервера!',
    type: DetailedInfoErrorResponseType,
    example: internalServerErrorExample(userProfilePathExample),
  })
  async getProfile(
    @Param('username') username: string,
  ): Promise<UserProfileResponseDto> {
    const profile = await this.getUserProfileUseCase.execute(username);

    return new UserProfileResponseDto(profile);
  }
}
