import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';

import RedisStore from 'connect-redis';
import * as session from 'express-session';
import { createClient } from 'redis';

import { AppModule } from './app/app.module';
import { envValidation } from './environments/env-validator';

async function bootstrap() {
  const env = envValidation();

  const app = await NestFactory.create<NestExpressApplication>(
    AppModule.forRoot(env),
  );

  const redisClient = createClient();
  try {
    redisClient.connect().catch(console.error);
  } catch (error: unknown) {
    Logger.error(`[Redis]: ${error}`);
  }

  const redisStore = new RedisStore({
    client: redisClient,
    prefix: 'myapp:',
  });

  Logger.log(`[Redis]: Clear all sessions`);
  redisStore.clear();

  if (env.isProd) {
    app.set('trust proxy', '127.0.0.1');
  }

  app.use(
    session({
      store: redisStore,
      secret: env.secret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: env.isProd,
      },
    }),
  );

  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  await app.listen(env.port, env.address);

  Logger.log(
    `🚀 Application is running on: http://${env.address}:${env.port}/${globalPrefix}`,
  );
}

bootstrap();
