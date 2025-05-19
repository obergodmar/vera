import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';

import RedisStore from 'connect-redis';
import * as session from 'express-session';
import { join } from 'path';
import { createClient } from 'redis';

import { AppModule } from './app/app.module';
import { injectEnvIntoIndexHtml } from './app/inject-env';
import { envValidation } from './environments/env-validator';

async function bootstrap() {
  const env = envValidation();

  const app = await NestFactory.create<NestExpressApplication>(
    AppModule.forRoot(env),
  );

  const redisClient = createClient({
    url: env.redisUrl,
  });
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

  if (env.trustProxy) {
    app.set('trust proxy', env.trustProxy);
  }

  app.use(
    session({
      store: redisStore,
      secret: env.secret,
      resave: false,
      saveUninitialized: false,
      proxy: !!env.trustProxy,
      cookie: {
        secure: env.isProd || undefined,
        sameSite: env.isProd ? 'lax' : undefined,
      },
    }),
  );

  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  app.enableShutdownHooks();

  const indexPath = join(__dirname, '..', 'frontend', 'index.html');

  injectEnvIntoIndexHtml(env, indexPath);

  await app.listen(env.port, env.address);

  Logger.log(
    `🚀 Application is running on: http://${env.address}:${env.port}/${globalPrefix}`,
  );
}

bootstrap();
