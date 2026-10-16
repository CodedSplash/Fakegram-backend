import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
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
import { BlockUserUseCase } from '@application/Block/blockUser.use-case';
import { UnblockUserUseCase } from '@application/Block/unblockUser.use-case';
import { GetBlockedUsersUseCase } from '@application/Block/getBlockedUsers.use-case';
import { CurrentUser } from '@presentation/decorators/currentUser.decorator';
import { IJwtTokenPayload } from '@domain/Jwt/types/jwtTokenPayload.interface';
import { UserIdParamDto } from '@presentation/dtos/User/userIdParam.dto';
import { FollowListQueryDto } from '@presentation/dtos/Follow/followListQuery.dto';
import { BlockActionResultDto } from '@presentation/dtos/Block/blockActionResult.dto';
import { BlockListResponseDto } from '@presentation/dtos/Block/blockListResponse.dto';
import { DEFAULT_FOLLOW_LIST_LIMIT } from '@presentation/constants/validation.constants';
import { FOLLOW_WRITE_THROTTLE } from '@presentation/constants/throttle.constants';
import { DefaultErrorResponseType } from '@presentation/types/defaultErrorResponse.type';
import { DetailedInfoErrorResponseType } from '@presentation/types/DetailedInfoErrorResponse.type';
import { ValidationErrorResponseType } from '@presentation/types/validationErrorResponse.type';
import {
  blockBadRequestExample,
  blockConflictExample,
  blockListBadRequestExample,
  blockListPathExample,
  blockListResponseExample,
  blockNotFoundExample,
  blockPathExample,
  blockSuccessExample,
  unblockBadRequestExample,
  unblockNotFoundExample,
  unblockSuccessExample,
} from '@presentation/swagger/examples/Block/block.example';
import { unauthorizedExample } from '@presentation/swagger/examples/general/unauthorized.example';
import { throttlerExceptionExample } from '@presentation/swagger/examples/general/throttlerException.example';
import { internalServerErrorExample } from '@presentation/swagger/examples/general/internalServerError.example';

// GET user/me/blocks не пересекается с user/me (MeController, AccountController);
// user/:id/block — новый третий сегмент, другие маршруты user/:id/* не затеняет.
@Controller('user')
@ApiTags('User block')
@ApiBearerAuth()
@ApiExtraModels(ValidationErrorResponseType, DetailedInfoErrorResponseType)
export class BlockController {
  constructor(
    private readonly blockUserUseCase: BlockUserUseCase,
    private readonly unblockUserUseCase: UnblockUserUseCase,
    private readonly getBlockedUsersUseCase: GetBlockedUsersUseCase,
  ) {}

  @Get('me/blocks')
  @ApiOkResponse({
    description: 'Пользователи, заблокированные текущим, сначала новые.',
    type: BlockListResponseDto,
    example: blockListResponseExample,
  })
  @ApiBadRequestResponse({
    description: 'Ошибки связанные с плохим запросом',
    content: blockListBadRequestExample,
  })
  @ApiUnauthorizedResponse({
    description: 'Пользователь не авторизован',
    type: DetailedInfoErrorResponseType,
    example: unauthorizedExample(blockListPathExample),
  })
  @ApiTooManyRequestsResponse({
    description: 'Слишком много запросов!',
    type: DefaultErrorResponseType,
    example: throttlerExceptionExample(blockListPathExample),
  })
  @ApiInternalServerErrorResponse({
    description: 'Ошибка на стороне сервера!',
    type: DetailedInfoErrorResponseType,
    example: internalServerErrorExample(blockListPathExample),
  })
  async getBlockedUsers(
    @Query() { limit, cursor }: FollowListQueryDto,
    @CurrentUser() user: IJwtTokenPayload,
  ): Promise<BlockListResponseDto> {
    return await this.getBlockedUsersUseCase.execute({
      userId: user.id,
      limit: Number(limit ?? DEFAULT_FOLLOW_LIST_LIMIT),
      cursor,
    });
  }

  @Post(':id/block')
  @HttpCode(HttpStatus.OK)
  @Throttle(FOLLOW_WRITE_THROTTLE)
  @ApiOkResponse({
    description:
      'Пользователь заблокирован; подписки и запросы в обе стороны удалены.',
    type: BlockActionResultDto,
    example: blockSuccessExample,
  })
  @ApiBadRequestResponse({
    description: 'Ошибки связанные с плохим запросом',
    content: blockBadRequestExample,
  })
  @ApiUnauthorizedResponse({
    description: 'Пользователь не авторизован',
    type: DetailedInfoErrorResponseType,
    example: unauthorizedExample(blockPathExample),
  })
  @ApiNotFoundResponse({
    description: 'Пользователь не найден или деактивирован',
    type: DetailedInfoErrorResponseType,
    example: blockNotFoundExample,
  })
  @ApiConflictResponse({
    description: 'Пользователь уже заблокирован',
    type: DetailedInfoErrorResponseType,
    example: blockConflictExample,
  })
  @ApiTooManyRequestsResponse({
    description: 'Слишком много запросов!',
    type: DefaultErrorResponseType,
    example: throttlerExceptionExample(blockPathExample),
  })
  @ApiInternalServerErrorResponse({
    description: 'Ошибка на стороне сервера!',
    type: DetailedInfoErrorResponseType,
    example: internalServerErrorExample(blockPathExample),
  })
  async block(
    @Param() { id }: UserIdParamDto,
    @CurrentUser() user: IJwtTokenPayload,
  ): Promise<BlockActionResultDto> {
    return await this.blockUserUseCase.execute({
      blockerId: user.id,
      blockedId: id,
    });
  }

  @Delete(':id/block')
  @HttpCode(HttpStatus.OK)
  @Throttle(FOLLOW_WRITE_THROTTLE)
  @ApiOkResponse({
    description: 'Пользователь разблокирован.',
    type: BlockActionResultDto,
    example: unblockSuccessExample,
  })
  @ApiBadRequestResponse({
    description: 'Ошибки связанные с плохим запросом',
    type: ValidationErrorResponseType,
    example: unblockBadRequestExample,
  })
  @ApiUnauthorizedResponse({
    description: 'Пользователь не авторизован',
    type: DetailedInfoErrorResponseType,
    example: unauthorizedExample(blockPathExample),
  })
  @ApiNotFoundResponse({
    description: 'Пользователь не заблокирован',
    type: DetailedInfoErrorResponseType,
    example: unblockNotFoundExample,
  })
  @ApiTooManyRequestsResponse({
    description: 'Слишком много запросов!',
    type: DefaultErrorResponseType,
    example: throttlerExceptionExample(blockPathExample),
  })
  @ApiInternalServerErrorResponse({
    description: 'Ошибка на стороне сервера!',
    type: DetailedInfoErrorResponseType,
    example: internalServerErrorExample(blockPathExample),
  })
  async unblock(
    @Param() { id }: UserIdParamDto,
    @CurrentUser() user: IJwtTokenPayload,
  ): Promise<BlockActionResultDto> {
    return await this.unblockUserUseCase.execute({
      blockerId: user.id,
      blockedId: id,
    });
  }
}
