import { Body, Controller, Get, Patch } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiExtraModels,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '@presentation/decorators/currentUser.decorator';
import { IJwtTokenPayload } from '@domain/Jwt/types/jwtTokenPayload.interface';
import { GetMyProfileUseCase } from '@application/User/getMyProfile.use-case';
import { UpdateMyProfileUseCase } from '@application/User/updateMyProfile.use-case';
import { OwnProfileResponseDto } from '@presentation/dtos/User/ownProfileResponse.dto';
import { UpdateMyProfileDto } from '@presentation/dtos/User/updateMyProfile.dto';
import { DefaultErrorResponseType } from '@presentation/types/defaultErrorResponse.type';
import { DetailedInfoErrorResponseType } from '@presentation/types/DetailedInfoErrorResponse.type';
import { ValidationErrorResponseType } from '@presentation/types/validationErrorResponse.type';
import { throttlerExceptionExample } from '@presentation/swagger/examples/general/throttlerException.example';
import { internalServerErrorExample } from '@presentation/swagger/examples/general/internalServerError.example';
import {
  mePathExample,
  meUnauthorizedExample,
  ownProfileResponseExample,
  updateMyProfileBadRequestExample,
} from '@presentation/swagger/examples/User/me.example';

@Controller('user/me')
@ApiTags('User profile')
@ApiBearerAuth()
@ApiExtraModels(ValidationErrorResponseType, DetailedInfoErrorResponseType)
export class MeController {
  constructor(
    private readonly getMyProfileUseCase: GetMyProfileUseCase,
    private readonly updateMyProfileUseCase: UpdateMyProfileUseCase,
  ) {}

  @Get()
  @ApiOkResponse({
    description: 'Собственный профиль, включая приватные поля.',
    type: OwnProfileResponseDto,
    example: ownProfileResponseExample,
  })
  @ApiUnauthorizedResponse({
    description: 'Пользователь не авторизован или не существует',
    type: DetailedInfoErrorResponseType,
    example: meUnauthorizedExample,
  })
  @ApiTooManyRequestsResponse({
    description: 'Слишком много запросов!',
    type: DefaultErrorResponseType,
    example: throttlerExceptionExample(mePathExample),
  })
  @ApiInternalServerErrorResponse({
    description: 'Ошибка на стороне сервера!',
    type: DetailedInfoErrorResponseType,
    example: internalServerErrorExample(mePathExample),
  })
  async getMe(
    @CurrentUser() user: IJwtTokenPayload,
  ): Promise<OwnProfileResponseDto> {
    const profile = await this.getMyProfileUseCase.execute(user.id);

    return new OwnProfileResponseDto(profile);
  }

  @Patch()
  @ApiOkResponse({
    description: 'Профиль обновлён, в ответе — актуальный собственный профиль.',
    type: OwnProfileResponseDto,
    example: ownProfileResponseExample,
  })
  @ApiBadRequestResponse({
    description: 'Ошибки связанные с плохим запросом',
    content: updateMyProfileBadRequestExample,
  })
  @ApiUnauthorizedResponse({
    description: 'Пользователь не авторизован или не существует',
    type: DetailedInfoErrorResponseType,
    example: meUnauthorizedExample,
  })
  @ApiTooManyRequestsResponse({
    description: 'Слишком много запросов!',
    type: DefaultErrorResponseType,
    example: throttlerExceptionExample(mePathExample),
  })
  @ApiInternalServerErrorResponse({
    description: 'Ошибка на стороне сервера!',
    type: DetailedInfoErrorResponseType,
    example: internalServerErrorExample(mePathExample),
  })
  async updateMe(
    @Body() dto: UpdateMyProfileDto,
    @CurrentUser() user: IJwtTokenPayload,
  ): Promise<OwnProfileResponseDto> {
    const profile = await this.updateMyProfileUseCase.execute(user.id, dto);

    return new OwnProfileResponseDto(profile);
  }
}
