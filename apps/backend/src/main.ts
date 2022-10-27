/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */
import {
  INestApplication,
  Logger,
  NestApplicationOptions,
  ValidationPipe,
} from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import * as fs from 'fs';

import { AppModule } from './app/app.module';
import { AllExceptionsFilter } from './filters/http-exception.filter';

let httpsOptions: NestApplicationOptions['httpsOptions'] = {};

try {
  httpsOptions.key = fs.readFileSync('./privkey.pem');

  httpsOptions.cert = fs.readFileSync('./fullchain.pem');
} catch (e) {
  console.error(e);

  httpsOptions = undefined;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { httpsOptions });

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  app.enableCors({
    origin: ['localhost', /https?:\/\/vera\.example\.com/],
  });
  const httpAdapter = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    })
  );

  setupOpenApi(app);

  const port = process.env.PORT || 3333;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();

function setupOpenApi(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setVersion('1.0')
    .addTag('api')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
}
