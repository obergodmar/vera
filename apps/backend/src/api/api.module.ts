import { MiddlewareConsumer, Module } from '@nestjs/common';

import { BotModule } from '../bot/bot.module';
import { AuthorizationMiddleware } from '../middlewares/authorization.middleware';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';

@Module({
  imports: [BotModule],
  controllers: [ApiController],
  providers: [ApiService],
})
export class ApiModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthorizationMiddleware).forRoutes(ApiController);
  }
}
