import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiExtraModels,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { GetFollowRequestsUseCase } from '@application/Follow/getFollowRequests.use-case';
import { AcceptFollowRequestUseCase } from '@application/Follow/acceptFollowRequest.use-case';
import { RejectFollowRequestUseCase } from '@application/Follow/rejectFollowRequest.use-case';
import { CancelFollowRequestUseCase } from '@application/Follow/cancelFollowRequest.use-case';
import { CurrentUser } from '@presentation/decorators/currentUser.decorator';
import { IJwtTokenPayload } from '@domain/Jwt/types/jwtTokenPayload.interface';
import { FollowListQueryDto } from '@presentation/dtos/Follow/followListQuery.dto';
import { RequesterIdParamDto } from '@presentation/dtos/Follow/requesterIdParam.dto';
import { TargetIdParamDto } from '@presentation/dtos/Follow/targetIdParam.dto';
import { FollowRequestListResponseDto } from '@presentation/dtos/Follow/followRequestListResponse.dto';
import { FollowRequestActionResultDto } from '@presentation/dtos/Follow/followRequestActionResult.dto';
import { DEFAULT_FOLLOW_LIST_LIMIT } from '@presentation/constants/validation.constants';
import { FOLLOW_WRITE_THROTTLE } from '@presentation/constants/throttle.constants';
import { DefaultErrorResponseType } from '@presentation/types/defaultErrorResponse.type';
import { DetailedInfoErrorResponseType } from '@presentation/types/DetailedInfoErrorResponse.type';
import { ValidationErrorResponseType } from '@presentation/types/validationErrorResponse.type';
import {
  cancelFollowRequestPathExample,
  followRequestActionPathExample,
  followRequestBadRequestExample,
  followRequestListBadRequestExample,
  followRequestListPathExample,
  followRequestListResponseExample,
  followRequestNotFoundExample,
  followRequestSuccessExample,
} from '@presentation/swagger/examples/Follow/followRequest.example';
import { unauthorizedExample } from '@presentation/swagger/examples/general/unauthorized.example';
import { throttlerExceptionExample } from '@presentation/swagger/examples/general/throttlerException.example';
import { internalServerErrorExample } from '@presentation/swagger/examples/general/internalServerError.example';

// Маршруты user/me/follow_requests не пересекаются с user/me (MeController,
// AccountController) и с user/:id/* (FollowController): другой второй сегмент.
@Controller('user')
@ApiTags('User follow requests')
@ApiBearerAuth()
@ApiExtraModels(ValidationErrorResponseType, DetailedInfoErrorResponseType)
export class FollowRequestController {
  constructor(
    private readonly getFollowRequestsUseCase: GetFollowRequestsUseCase,
    private readonly acceptFollowRequestUseCase: AcceptFollowRequestUseCase,
    private readonly rejectFollowRequestUseCase: RejectFollowRequestUseCase,
    private readonly cancelFollowRequestUseCase: CancelFollowRequestUseCase,
  ) {}

  @Get('me/follow_requests')
  @ApiOkResponse({
    description: 'Входящие запросы на подписку, сначала новые.',
    type: FollowRequestListResponseDto,
    example: followRequestListResponseExample,
  })
  @ApiBadRequestResponse({
    description: 'Ошибки связанные с плохим запросом',
    content: followRequestListBadRequestExample,
  })
  @ApiUnauthorizedResponse({
    description: 'Пользователь не авторизован',
    type: DetailedInfoErrorResponseType,
    example: unauthorizedExample(followRequestListPathExample),
  })
  @ApiTooManyRequestsResponse({
    description: 'Слишком много запросов!',
    type: DefaultErrorResponseType,
    example: throttlerExceptionExample(followRequestListPathExample),
  })
  @ApiInternalServerErrorResponse({
    description: 'Ошибка на стороне сервера!',
    type: DetailedInfoErrorResponseType,
    example: internalServerErrorExample(followRequestListPathExample),
  })
  async getFollowRequests(
    @Query() { limit, cursor }: FollowListQueryDto,
    @CurrentUser() user: IJwtTokenPayload,
  ): Promise<FollowRequestListResponseDto> {
    return await this.getFollowRequestsUseCase.execute({
      userId: user.id,
      limit: Number(limit ?? DEFAULT_FOLLOW_LIST_LIMIT),
      cursor,
    });
  }

  @Post('me/follow_requests/:requesterId/accept')
  @HttpCode(HttpStatus.OK)
  @Throttle(FOLLOW_WRITE_THROTTLE)
  @ApiOkResponse({
    description:
      'Запрос принят: requesterId подписан на текущего пользователя.',
    type: FollowRequestActionResultDto,
    example: followRequestSuccessExample('Запрос на подписку принят.'),
  })
  @ApiBadRequestResponse({
    description: 'Ошибки связанные с плохим запросом',
    type: ValidationErrorResponseType,
    example: followRequestBadRequestExample(
      '/user/me/follow_requests/123/accept',
    ),
  })
  @ApiUnauthorizedResponse({
    description: 'Пользователь не авторизован',
    type: DetailedInfoErrorResponseType,
    example: unauthorizedExample(followRequestActionPathExample('accept')),
  })
  @ApiNotFoundResponse({
    description: 'Запрос на подписку не найден',
    type: DetailedInfoErrorResponseType,
    example: followRequestNotFoundExample(
      followRequestActionPathExample('accept'),
    ),
  })
  @ApiTooManyRequestsResponse({
    description: 'Слишком много запросов!',
    type: DefaultErrorResponseType,
    example: throttlerExceptionExample(
      followRequestActionPathExample('accept'),
    ),
  })
  @ApiInternalServerErrorResponse({
    description: 'Ошибка на стороне сервера!',
    type: DetailedInfoErrorResponseType,
    example: internalServerErrorExample(
      followRequestActionPathExample('accept'),
    ),
  })
  async accept(
    @Param() { requesterId }: RequesterIdParamDto,
    @CurrentUser() user: IJwtTokenPayload,
  ): Promise<FollowRequestActionResultDto> {
    return await this.acceptFollowRequestUseCase.execute({
      requesterId,
      targetId: user.id,
    });
  }

  @Post('me/follow_requests/:requesterId/reject')
  @HttpCode(HttpStatus.OK)
  @Throttle(FOLLOW_WRITE_THROTTLE)
  @ApiOkResponse({
    description: 'Запрос отклонён и удалён.',
    type: FollowRequestActionResultDto,
    example: followRequestSuccessExample('Запрос на подписку отклонён.'),
  })
  @ApiBadRequestResponse({
    description: 'Ошибки связанные с плохим запросом',
    type: ValidationErrorResponseType,
    example: followRequestBadRequestExample(
      '/user/me/follow_requests/123/reject',
    ),
  })
  @ApiUnauthorizedResponse({
    description: 'Пользователь не авторизован',
    type: DetailedInfoErrorResponseType,
    example: unauthorizedExample(followRequestActionPathExample('reject')),
  })
  @ApiNotFoundResponse({
    description: 'Запрос на подписку не найден',
    type: DetailedInfoErrorResponseType,
    example: followRequestNotFoundExample(
      followRequestActionPathExample('reject'),
    ),
  })
  @ApiTooManyRequestsResponse({
    description: 'Слишком много запросов!',
    type: DefaultErrorResponseType,
    example: throttlerExceptionExample(
      followRequestActionPathExample('reject'),
    ),
  })
  @ApiInternalServerErrorResponse({
    description: 'Ошибка на стороне сервера!',
    type: DetailedInfoErrorResponseType,
    example: internalServerErrorExample(
      followRequestActionPathExample('reject'),
    ),
  })
  async reject(
    @Param() { requesterId }: RequesterIdParamDto,
    @CurrentUser() user: IJwtTokenPayload,
  ): Promise<FollowRequestActionResultDto> {
    return await this.rejectFollowRequestUseCase.execute({
      requesterId,
      targetId: user.id,
    });
  }

  @Delete('follow_requests/:targetId')
  @HttpCode(HttpStatus.OK)
  @Throttle(FOLLOW_WRITE_THROTTLE)
  @ApiOkResponse({
    description: 'Собственный запрос на подписку на targetId отменён.',
    type: FollowRequestActionResultDto,
    example: followRequestSuccessExample('Запрос на подписку отменён.'),
  })
  @ApiBadRequestResponse({
    description: 'Ошибки связанные с плохим запросом',
    type: ValidationErrorResponseType,
    example: followRequestBadRequestExample('/user/follow_requests/123'),
  })
  @ApiUnauthorizedResponse({
    description: 'Пользователь не авторизован',
    type: DetailedInfoErrorResponseType,
    example: unauthorizedExample(cancelFollowRequestPathExample),
  })
  @ApiNotFoundResponse({
    description: 'Запрос на подписку не найден',
    type: DetailedInfoErrorResponseType,
    example: followRequestNotFoundExample(cancelFollowRequestPathExample),
  })
  @ApiTooManyRequestsResponse({
    description: 'Слишком много запросов!',
    type: DefaultErrorResponseType,
    example: throttlerExceptionExample(cancelFollowRequestPathExample),
  })
  @ApiInternalServerErrorResponse({
    description: 'Ошибка на стороне сервера!',
    type: DetailedInfoErrorResponseType,
    example: internalServerErrorExample(cancelFollowRequestPathExample),
  })
  async cancel(
    @Param() { targetId }: TargetIdParamDto,
    @CurrentUser() user: IJwtTokenPayload,
  ): Promise<FollowRequestActionResultDto> {
    return await this.cancelFollowRequestUseCase.execute({
      requesterId: user.id,
      targetId,
    });
  }
}
