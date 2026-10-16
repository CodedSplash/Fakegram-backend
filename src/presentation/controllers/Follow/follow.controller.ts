import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiExtraModels,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { FOLLOW_WRITE_THROTTLE } from '@presentation/constants/throttle.constants';
import { FollowDto } from '@presentation/dtos/Follow/follow.dto';
import { FollowUseCase } from '@application/Follow/follow.use-case';
import { UnfollowUseCase } from '@application/Follow/unfollow.use-case';
import { GetFollowersUseCase } from '@application/Follow/getFollowers.use-case';
import { GetFollowingsUseCase } from '@application/Follow/getFollowings.use-case';
import { IsFollowingUseCase } from '@application/Follow/isFollowing.use-case';
import { CurrentUser } from '@presentation/decorators/currentUser.decorator';
import { IJwtTokenPayload } from '@domain/Jwt/types/jwtTokenPayload.interface';
import { UserIdParamDto } from '@presentation/dtos/User/userIdParam.dto';
import { FollowListQueryDto } from '@presentation/dtos/Follow/followListQuery.dto';
import { FollowListResponseDto } from '@presentation/dtos/Follow/followListResponse.dto';
import { IsFollowingResponseDto } from '@presentation/dtos/Follow/isFollowingResponse.dto';
import { DEFAULT_FOLLOW_LIST_LIMIT } from '@presentation/constants/validation.constants';
import { DefaultErrorResponseType } from '@presentation/types/defaultErrorResponse.type';
import { FollowSuccessResultDto } from '@presentation/dtos/Follow/followSuccessResult.dto';
import { DetailedInfoErrorResponseType } from '@presentation/types/DetailedInfoErrorResponse.type';
import {
  followRequestedExample,
  followSuccessExample,
} from '@presentation/swagger/examples/Follow/followSuccess.example';
import { UnfollowSuccessResponseDto } from '@presentation/dtos/Follow/unfollowSuccessResponse.dto';
import { unfollowSuccessExample } from '@presentation/swagger/examples/Follow/unfollowSuccess.example';
import { ValidationErrorResponseType } from '@presentation/types/validationErrorResponse.type';
import {
  FollowBadRequestExample,
  followConflictExamples,
  followForbiddenExample,
  followNotFoundExample,
} from '@presentation/swagger/examples/Follow/followBadRequest.example';
import {
  unfollowBadRequestExample,
  unfollowNotFoundExample,
} from '@presentation/swagger/examples/Follow/unfollowBadRequest.example';
import {
  followListBadRequestExample,
  followListForbiddenExample,
  followListNotFoundExample,
  followListPathExample,
  followListResponseExample,
} from '@presentation/swagger/examples/Follow/followList.example';
import {
  isFollowingBadRequestExample,
  isFollowingPathExample,
  isFollowingResponseExample,
} from '@presentation/swagger/examples/Follow/isFollowing.example';
import { unauthorizedExample } from '@presentation/swagger/examples/general/unauthorized.example';
import { throttlerExceptionExample } from '@presentation/swagger/examples/general/throttlerException.example';
import { internalServerErrorExample } from '@presentation/swagger/examples/general/internalServerError.example';

@Controller('user')
@ApiTags('User follow')
@ApiBearerAuth()
@ApiExtraModels(ValidationErrorResponseType, DetailedInfoErrorResponseType)
export class FollowController {
  constructor(
    private readonly followUseCase: FollowUseCase,
    private readonly unfollowUseCase: UnfollowUseCase,
    private readonly getFollowersUseCase: GetFollowersUseCase,
    private readonly getFollowingsUseCase: GetFollowingsUseCase,
    private readonly isFollowingUseCase: IsFollowingUseCase,
  ) {}

  @Post('follow')
  @HttpCode(HttpStatus.OK)
  @Throttle(FOLLOW_WRITE_THROTTLE)
  @ApiOkResponse({
    description:
      'Подписка оформлена (status: following) или, для закрытого аккаунта, отправлен запрос (status: requested).',
    type: FollowSuccessResultDto,
    examples: {
      following: { summary: 'Открытый аккаунт', value: followSuccessExample },
      requested: {
        summary: 'Закрытый аккаунт',
        value: followRequestedExample,
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Ошибки связанные с плохим запросом',
    content: FollowBadRequestExample,
  })
  @ApiUnauthorizedResponse({
    description: 'Пользователь не авторизован',
    type: DetailedInfoErrorResponseType,
    example: unauthorizedExample('/user/follow'),
  })
  @ApiNotFoundResponse({
    description: 'Пользователь не найден или деактивирован',
    type: DetailedInfoErrorResponseType,
    example: followNotFoundExample,
  })
  @ApiForbiddenResponse({
    description: 'Блокировка между пользователями',
    type: DetailedInfoErrorResponseType,
    example: followForbiddenExample,
  })
  @ApiConflictResponse({
    description: 'Подписка или запрос на подписку уже существуют',
    content: followConflictExamples,
  })
  @ApiTooManyRequestsResponse({
    description: 'Слишком много запросов!',
    type: DefaultErrorResponseType,
    example: throttlerExceptionExample('/user/follow'),
  })
  @ApiInternalServerErrorResponse({
    description: 'Ошибка на стороне сервера!',
    type: DetailedInfoErrorResponseType,
    example: internalServerErrorExample('/user/follow/'),
  })
  async follow(
    @Body() { followingId }: FollowDto,
    @CurrentUser() user: IJwtTokenPayload,
  ) {
    return await this.followUseCase.execute({
      followerId: user.id,
      followingId,
    });
  }

  @ApiOkResponse({
    description: 'Успешная отписка от пользователя.',
    type: UnfollowSuccessResponseDto,
    example: unfollowSuccessExample,
  })
  @ApiBadRequestResponse({
    description: 'Ошибки связанные с плохим запросом',
    type: ValidationErrorResponseType,
    example: unfollowBadRequestExample,
  })
  @ApiUnauthorizedResponse({
    description: 'Пользователь не авторизован',
    type: DetailedInfoErrorResponseType,
    example: unauthorizedExample('/user/unfollow'),
  })
  @ApiNotFoundResponse({
    description: 'Подписка не найдена',
    type: DetailedInfoErrorResponseType,
    example: unfollowNotFoundExample,
  })
  @ApiTooManyRequestsResponse({
    description: 'Слишком много запросов!',
    type: DefaultErrorResponseType,
    example: throttlerExceptionExample('/user/unfollow'),
  })
  @ApiInternalServerErrorResponse({
    description: 'Ошибка на стороне сервера!',
    type: DetailedInfoErrorResponseType,
    example: internalServerErrorExample('/user/unfollow/'),
  })
  @Post('unfollow')
  @HttpCode(HttpStatus.OK)
  @Throttle(FOLLOW_WRITE_THROTTLE)
  async unfollow(
    @Body() { followingId }: FollowDto,
    @CurrentUser() user: IJwtTokenPayload,
  ) {
    return await this.unfollowUseCase.execute({
      followerId: user.id,
      followingId,
    });
  }

  @Get(':id/followers')
  @ApiOkResponse({
    description: 'Подписчики пользователя, сначала новые.',
    type: FollowListResponseDto,
    example: followListResponseExample,
  })
  @ApiBadRequestResponse({
    description: 'Ошибки связанные с плохим запросом',
    content: followListBadRequestExample('followers'),
  })
  @ApiUnauthorizedResponse({
    description: 'Пользователь не авторизован',
    type: DetailedInfoErrorResponseType,
    example: unauthorizedExample(followListPathExample('followers')),
  })
  @ApiForbiddenResponse({
    description: 'Закрытый аккаунт: списки видят только владелец и подписчики',
    type: DetailedInfoErrorResponseType,
    example: followListForbiddenExample('followers'),
  })
  @ApiNotFoundResponse({
    description:
      'Пользователь не найден, деактивирован или между пользователями есть блокировка',
    type: DetailedInfoErrorResponseType,
    example: followListNotFoundExample('followers'),
  })
  @ApiTooManyRequestsResponse({
    description: 'Слишком много запросов!',
    type: DefaultErrorResponseType,
    example: throttlerExceptionExample(followListPathExample('followers')),
  })
  @ApiInternalServerErrorResponse({
    description: 'Ошибка на стороне сервера!',
    type: DetailedInfoErrorResponseType,
    example: internalServerErrorExample(followListPathExample('followers')),
  })
  async getFollowers(
    @Param() { id }: UserIdParamDto,
    @Query() { limit, cursor }: FollowListQueryDto,
    @CurrentUser() user: IJwtTokenPayload,
  ): Promise<FollowListResponseDto> {
    return await this.getFollowersUseCase.execute({
      userId: id,
      viewerId: user.id,
      limit: Number(limit ?? DEFAULT_FOLLOW_LIST_LIMIT),
      cursor,
    });
  }

  @Get(':id/followings')
  @ApiOkResponse({
    description: 'Подписки пользователя, сначала новые.',
    type: FollowListResponseDto,
    example: followListResponseExample,
  })
  @ApiBadRequestResponse({
    description: 'Ошибки связанные с плохим запросом',
    content: followListBadRequestExample('followings'),
  })
  @ApiUnauthorizedResponse({
    description: 'Пользователь не авторизован',
    type: DetailedInfoErrorResponseType,
    example: unauthorizedExample(followListPathExample('followings')),
  })
  @ApiForbiddenResponse({
    description: 'Закрытый аккаунт: списки видят только владелец и подписчики',
    type: DetailedInfoErrorResponseType,
    example: followListForbiddenExample('followings'),
  })
  @ApiNotFoundResponse({
    description:
      'Пользователь не найден, деактивирован или между пользователями есть блокировка',
    type: DetailedInfoErrorResponseType,
    example: followListNotFoundExample('followings'),
  })
  @ApiTooManyRequestsResponse({
    description: 'Слишком много запросов!',
    type: DefaultErrorResponseType,
    example: throttlerExceptionExample(followListPathExample('followings')),
  })
  @ApiInternalServerErrorResponse({
    description: 'Ошибка на стороне сервера!',
    type: DetailedInfoErrorResponseType,
    example: internalServerErrorExample(followListPathExample('followings')),
  })
  async getFollowings(
    @Param() { id }: UserIdParamDto,
    @Query() { limit, cursor }: FollowListQueryDto,
    @CurrentUser() user: IJwtTokenPayload,
  ): Promise<FollowListResponseDto> {
    return await this.getFollowingsUseCase.execute({
      userId: id,
      viewerId: user.id,
      limit: Number(limit ?? DEFAULT_FOLLOW_LIST_LIMIT),
      cursor,
    });
  }

  @Get(':id/is_following')
  @ApiOkResponse({
    description:
      'Подписан ли текущий пользователь на :id; status: none | requested | following.',
    type: IsFollowingResponseDto,
    example: isFollowingResponseExample,
  })
  @ApiBadRequestResponse({
    description: 'Ошибки связанные с плохим запросом',
    type: ValidationErrorResponseType,
    example: isFollowingBadRequestExample,
  })
  @ApiUnauthorizedResponse({
    description: 'Пользователь не авторизован',
    type: DetailedInfoErrorResponseType,
    example: unauthorizedExample(isFollowingPathExample),
  })
  @ApiTooManyRequestsResponse({
    description: 'Слишком много запросов!',
    type: DefaultErrorResponseType,
    example: throttlerExceptionExample(isFollowingPathExample),
  })
  @ApiInternalServerErrorResponse({
    description: 'Ошибка на стороне сервера!',
    type: DetailedInfoErrorResponseType,
    example: internalServerErrorExample(isFollowingPathExample),
  })
  async isFollowing(
    @Param() { id }: UserIdParamDto,
    @CurrentUser() user: IJwtTokenPayload,
  ): Promise<IsFollowingResponseDto> {
    return await this.isFollowingUseCase.execute({
      followerId: user.id,
      followingId: id,
    });
  }
}
