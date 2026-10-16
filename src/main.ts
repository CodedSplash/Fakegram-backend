import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from '@src/app.module';

const DEFAULT_CORS_ORIGINS = 'http://localhost:3000';

// Список origin через запятую. "*" запрещён: с credentials браузер его не примет.
const parseCorsOrigins = (value: string): string[] => {
  const origins = value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (origins.includes('*')) {
    throw new Error('CORS_ORIGINS не может содержать "*" вместе с cookie.');
  }

  return origins;
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.enableShutdownHooks();
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  // credentials: фронт отправляет refresh-токен в httpOnly-cookie
  app.enableCors({
    origin: parseCorsOrigins(
      configService.get<string>('CORS_ORIGINS', DEFAULT_CORS_ORIGINS),
    ),
    credentials: true,
  });

  const isSwaggerEnabled =
    configService.get('MODE_ENV') === 'dev' ||
    configService.get('SWAGGER_ENABLED') === 'true';

  if (isSwaggerEnabled) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Fakegram API')
      .setDescription('Документация по Fakegram API')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('swagger', app, swaggerDocument);
  }

  await app.listen(configService.get('PORT') ?? 8080);
}

bootstrap();
