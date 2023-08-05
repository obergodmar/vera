import { MiddlewareConsumer, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConvoModule } from '../convo/convo.module';
import { AuthorizationMiddleware } from '../middlewares/authorization.middleware';
import { DutyController } from './duty.controller';
import { Duty } from './duty.entity';
import { DutyService } from './duty.service';

@Module({
  imports: [TypeOrmModule.forFeature([Duty]), ConvoModule],
  providers: [DutyService],
  controllers: [DutyController],
})
export class DutyModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthorizationMiddleware).forRoutes(DutyController);
  }
}
