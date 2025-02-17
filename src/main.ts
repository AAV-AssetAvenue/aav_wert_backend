import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./http-exception.filter";
import { setupSwagger } from "./swagger.api.docs";
import {
  WINSTON_MODULE_NEST_PROVIDER,
  WinstonModule,
  utilities as nestWinstonModuleUtilities,
} from "nest-winston";
import * as winston from "winston";
import helmet from "helmet";
import { ResponseInterceptor } from "./interceptors/response.interceptor";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.ms(),
            nestWinstonModuleUtilities.format.nestLike("Asset Avenue Service", {
              colors: true,
              prettyPrint: true,
            })
          ),
        }),
      ],
    }),
  });
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());

  setupSwagger(app);
  app.enableCors();
  app.use(helmet());
  await app.listen(process.env.PORT || 3039);
}
bootstrap();
