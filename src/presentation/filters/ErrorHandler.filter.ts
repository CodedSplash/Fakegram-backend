import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Catch(HttpException)
export class ErrorHandlerFilter implements ExceptionFilter {
  constructor(private configService: ConfigService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Ошибка на стороне сервера';
    const detailedError =
      this.configService.get('MODE_ENV') === 'dev' &&
      exception instanceof HttpException
        ? exception.cause
        : null;

    res.status(status).json({
      status,
      error: message,
      path: req.url,
      ...(detailedError ? { detailedError } : {}),
    });
  }
}
