import { MiddlewareConsumer, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthorizationMiddleware } from '../middlewares/authorization.middleware';
import { ConvoController } from './convo.controller';
import { Convo } from './convo.entity';
import { ConvoService } from './convo.service';

@Module({
  imports: [TypeOrmModule.forFeature([Convo])],
  providers: [ConvoService],
  controllers: [ConvoController],
  exports: [TypeOrmModule, ConvoService],
})
export class ConvoModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthorizationMiddleware).forRoutes(ConvoController);
  }
}
