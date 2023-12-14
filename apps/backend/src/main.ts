import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app/app.module';
import { envValidation } from './environments/env-validator';

async function bootstrap() {
  const env = envValidation();

  const app = await NestFactory.create(AppModule.forRoot(env));

  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  await app.listen(env.port, env.address);

  Logger.log(
    `🚀 Application is running on: http://${env.address}:${env.port}/${globalPrefix}`,
  );
}

bootstrap();
