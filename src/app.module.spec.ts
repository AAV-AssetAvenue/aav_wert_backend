import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './app.module';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { HealthModule } from './health/health.module';
import { DoordashModule } from './doordash/doordash.module';
import { MongooseModule } from '@nestjs/mongoose';
import { SentryModule } from '@ntegral/nestjs-sentry';
import {
  WINSTON_MODULE_NEST_PROVIDER,
  WinstonModule,
  utilities as nestWinstonModuleUtilities,
} from 'nest-winston';
import * as winston from 'winston';
import { HttpLoggerMiddleware } from './http.logger.middleware';
import { MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppModule', () => {
  let appModule: AppModule;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        SentryModule.forRoot({
          dsn: process.env.SENTRY_DNS,
          debug: true,
          environment: process.env.ENVIRONMENT,
          release: 'some_release',
          logLevels: ['debug'],
        }),
        ConfigModule.forRoot({
          isGlobal: true,
          load: [configuration],
        }),
        MongooseModule.forRoot(process.env.DATABASE_URL),
        HealthModule,
        DoordashModule,
        WinstonModule.forRoot({
          transports: [
            new winston.transports.Console({
              format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.ms(),
                nestWinstonModuleUtilities.format.nestLike(
                  'Nest & Prisma Learning',
                  {
                    colors: true,
                    prettyPrint: true,
                  },
                ),
              ),
            }),
          ],
        }),
      ],
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appModule = moduleRef.get<AppModule>(AppModule);
  });

  it('should be defined', () => {
    expect(appModule).toBeDefined();
  });

  it('should apply HttpLoggerMiddleware', () => {
    const consumer = {
      apply: jest.fn(() => consumer),
      forRoutes: jest.fn(),
    };

    appModule.configure(consumer as unknown as MiddlewareConsumer);

    expect(consumer.apply).toHaveBeenCalledWith(HttpLoggerMiddleware);
    expect(consumer.forRoutes).toHaveBeenCalledWith({
      path: '*',
      method: RequestMethod.ALL,
    });
  });
});
