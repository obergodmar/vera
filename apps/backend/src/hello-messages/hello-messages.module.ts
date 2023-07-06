import { MiddlewareConsumer, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConvoModule } from '../database/convo.module';
import { LoggerModule } from '../logger/logger.module';
import { AuthorizationMiddleware } from '../middlewares/authorization.middleware';
import { VkApiModule } from '../vk-api/vk-api.module';
import { HelloMessagesController } from './hello-messages.controller';
import { HelloMessage } from './hello-messages.entity';
import { HelloMessagesService } from './hello-messages.service';

@Module({
  imports: [
    VkApiModule,
    LoggerModule,
    TypeOrmModule.forFeature([HelloMessage]),
    ConvoModule,
  ],
  providers: [HelloMessagesService],
  controllers: [HelloMessagesController],
})
export class HelloMessagesModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthorizationMiddleware).forRoutes(HelloMessagesController);
  }
}
