import { MiddlewareConsumer, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConvoModule } from '../convo/convo.module';
import { AuthorizationMiddleware } from '../middlewares/authorization.middleware';
import { HelloMessagesController } from './hello-messages.controller';
import { HelloMessage } from './hello-messages.entity';
import { HelloMessagesService } from './hello-messages.service';

@Module({
  imports: [TypeOrmModule.forFeature([HelloMessage]), ConvoModule],
  providers: [HelloMessagesService],
  controllers: [HelloMessagesController],
})
export class HelloMessagesModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthorizationMiddleware).forRoutes(HelloMessagesController);
  }
}
