import { MiddlewareConsumer, Module } from '@nestjs/common';

import { AuthorizationMiddleware } from '../middlewares/authorization.middleware';
import { ConfigController } from './config.controller';
import { ConfigService } from './config.service';

@Module({
  controllers: [ConfigController],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthorizationMiddleware).forRoutes(ConfigController);
  }
}
