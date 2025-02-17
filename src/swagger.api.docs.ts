import { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

export const setupSwagger = (app: INestApplication) => {
  const config = new DocumentBuilder()
    .setTitle("Asset Avenue Service")
    .setDescription("The Asset Avenue Service API description")
    .setVersion("1.0")
    .addServer("http://localhost:3333/", "Local environment")
    .addServer("https://staging.yourapi.com/", "Staging")
    .addServer("https://production.yourapi.com/", "Production")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("docs", app, document);
};
