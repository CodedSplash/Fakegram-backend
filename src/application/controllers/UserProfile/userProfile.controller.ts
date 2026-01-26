import { Controller, Get, Inject, Param } from '@nestjs/common';
import {
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import { Public } from '../../decorators/isPublic.decorator';
import { UserProfileService } from '../../../core/UserProfile/servicies/userProfile.service';
import { IUserProfileService } from '../../../core/UserProfile/servicies/userProfile.service.interface';
import { HasUserResponseDto } from '../../dtos/UserProfile/hasUserResponse.dto';
import { internalServerErrorExample } from 'src/application/swagger/examples/general/internalServerError.example';
import { throttlerExceptionExample } from 'src/application/swagger/examples/general/throttlerException.example';
import { hasUserNotFoundExample } from 'src/application/swagger/examples/UserProfile/hasUserNotFound.example';
import { hasUserResponseExample } from 'src/application/swagger/examples/UserProfile/hasUserResponse.example';
import { DefaultErrorResponseType } from 'src/application/types/defaultErrorResponse.type';
import { DetailedInfoErrorResponseType } from 'src/application/types/DetailedInfoErrorResponse.type';

@Controller('user')
@ApiTags('User profile')
export class UserProfileController {
  constructor(
    @Inject(UserProfileService)
    private readonly userProfileService: IUserProfileService,
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
    const user = await this.userProfileService.hasUser(username);

    return new HasUserResponseDto(user);
  }
}
