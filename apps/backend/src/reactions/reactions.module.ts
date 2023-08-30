import { MiddlewareConsumer, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthorizationMiddleware } from '../middlewares/authorization.middleware';
import { ReactionsController } from './reactions.controller';
import { Reaction } from './reactions.entity';
import { ReactionsService } from './reactions.service';

@Module({
  imports: [TypeOrmModule.forFeature([Reaction])],
  providers: [ReactionsService],
  controllers: [ReactionsController],
})
export class ReactionsModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthorizationMiddleware).forRoutes(ReactionsController);
  }
}
