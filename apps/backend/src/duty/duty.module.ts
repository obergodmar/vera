import { MiddlewareConsumer, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConvoModule } from '../convo/convo.module';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import { DutyController } from './duty.controller';
import { Duty } from './duty.entity';
import { DutyService } from './duty.service';

@Module({
  imports: [TypeOrmModule.forFeature([Duty]), ConvoModule],
  providers: [DutyService],
  controllers: [DutyController],
  exports: [DutyService],
})
export class DutyModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(DutyController);
  }
}
