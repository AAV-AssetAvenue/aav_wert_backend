import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
  private logger: Logger = new Logger('NestApplication');

  use(request: Request, response: Response, next: NextFunction): void {
    const {
      url,
      method,
      query: queryParams,
      baseUrl: path,
      ip,
      headers,
      params,
    } = request;

    // logging request
    setImmediate(async () => {
      const requestLog = {
        url,
        method,
        path,
        queryParams,
        params,
        body: request.body,
        ip,
        headers,
      };
      this.logger.log(`Request: ${JSON.stringify(requestLog)}`);
    });

    // extracting response's body
    let body = {};
    const oldEnd = response.end;
    const chunks: Buffer[] = [];
    response.end = (chunk) => {
      if (chunk) {
        chunks.push(Buffer.from(chunk));
      }
      body = Buffer.concat(chunks).toString('utf8');
      return oldEnd.call(response, body);
    };

    // logging response
    response.on('finish', async () => {
      return setTimeout(() => {
        const responseLog = {
          url,
          method,
          path,
          statusCode: response.statusCode,
          body,
        };

        if (response.statusCode >= 400) {
          this.logger.error(`Response: ${JSON.stringify(responseLog)}`);
        } else {
          this.logger.log(`Response: ${JSON.stringify(responseLog)}`);
        }
      }, 0);
    });

    next();
  }
}
