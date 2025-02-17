import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    response.status(status).json({
      statusCode: status,
      message: request.url.includes('/health')
        ? exception.getResponse()
        : exception.message?.toLowerCase(),
      timestamp: new Date().toISOString(),
      path: request.url,
      lineNumber: exception.stack?.split('\n')[1].trim(),
    });
  }
}
