import { MiddlewareConsumer, Module } from '@nestjs/common';

import { AuthMiddleware } from '../middlewares/auth.middleware';
import { ConvoController } from './convo.controller';
import { ConvoService } from './convo.service';

@Module({
  providers: [ConvoService],
  controllers: [ConvoController],
  exports: [ConvoService],
})
export class ConvoModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(ConvoController);
  }
}
