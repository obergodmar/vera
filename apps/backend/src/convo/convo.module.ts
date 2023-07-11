import { MiddlewareConsumer, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LoggerModule } from '../logger/logger.module';
import { AuthorizationMiddleware } from '../middlewares/authorization.middleware';
import { VkApiModule } from '../vk-api/vk-api.module';
import { ConvoController } from './convo.controller';
import { Convo } from './convo.entity';
import { ConvoService } from './convo.service';

@Module({
  imports: [VkApiModule, LoggerModule, TypeOrmModule.forFeature([Convo])],
  providers: [ConvoService],
  controllers: [ConvoController],
  exports: [TypeOrmModule, ConvoService],
})
export class ConvoModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthorizationMiddleware).forRoutes(ConvoController);
  }
}
