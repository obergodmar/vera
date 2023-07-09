import { MiddlewareConsumer, Module } from '@nestjs/common';

import { ConfigModule } from '../config/config.module';
import { ConvoModule } from '../convo/convo.module';
import { LoggerModule } from '../logger/logger.module';
import { AuthorizationMiddleware } from '../middlewares/authorization.middleware';
import { VkApiModule } from '../vk-api/vk-api.module';
import { DutyController } from './duty.controller';
import { DutyService } from './duty.service';

@Module({
  imports: [VkApiModule, ConfigModule, LoggerModule, ConvoModule],
  providers: [DutyService],
  controllers: [DutyController],
})
export class DutyModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthorizationMiddleware).forRoutes(DutyController);
  }
}
