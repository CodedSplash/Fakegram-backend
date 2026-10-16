import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ConflictException,
  ExceptionFilter,
  ForbiddenException,
  HttpException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import {
  ConflictError,
  DomainError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from '@domain/common/errors/domain.error';

type DomainErrorClass = abstract new (...args: never[]) => DomainError;
type HttpExceptionClass = new (message: string) => HttpException;

const DOMAIN_ERROR_TO_HTTP: [DomainErrorClass, HttpExceptionClass][] = [
  [ValidationError, BadRequestException],
  [UnauthorizedError, UnauthorizedException],
  [ForbiddenError, ForbiddenException],
  [NotFoundError, NotFoundException],
  [ConflictError, ConflictException],
];

@Catch()
export class ErrorHandlerFilter implements ExceptionFilter {
  private readonly logger = new Logger(ErrorHandlerFilter.name);

  constructor(private configService: ConfigService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    if (host.getType() !== 'http') {
      throw exception;
    }

    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();
    const httpException = this.toHttpException(exception);
    const status = httpException.getStatus();
    const isDev = this.configService.get('MODE_ENV') === 'dev';

    const isExpected =
      exception instanceof HttpException || exception instanceof DomainError;

    if (!isExpected) {
      this.logger.error(
        `${req.method} ${req.url}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    const detailedError = isDev ? this.getDetailedError(exception) : null;

    res.status(status).json({
      status,
      error: httpException.getResponse(),
      path: req.url,
      ...(detailedError ? { detailedError } : {}),
    });
  }

  private toHttpException(exception: unknown): HttpException {
    if (exception instanceof HttpException) {
      return exception;
    }

    if (exception instanceof DomainError) {
      const mapping = DOMAIN_ERROR_TO_HTTP.find(
        ([errorClass]) => exception instanceof errorClass,
      );

      if (mapping) {
        return new mapping[1](exception.message);
      }
    }

    return new InternalServerErrorException('Ошибка на стороне сервера');
  }

  private getDetailedError(exception: unknown): unknown {
    if (exception instanceof HttpException) {
      return exception.cause;
    }

    if (exception instanceof DomainError) {
      return null;
    }

    if (exception instanceof Error) {
      return {
        name: exception.name,
        message: exception.message,
        stack: exception.stack,
      };
    }

    return exception;
  }
}
