import { MiddlewareConsumer, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DutyModule } from '../duty/duty.module';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import { ReactionsController } from './reactions.controller';
import { Reaction } from './reactions.entity';
import { ReactionsService } from './reactions.service';

@Module({
  imports: [TypeOrmModule.forFeature([Reaction]), DutyModule],
  providers: [ReactionsService],
  controllers: [ReactionsController],
})
export class ReactionsModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(ReactionsController);
  }
}
