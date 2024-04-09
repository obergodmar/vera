import { MiddlewareConsumer, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthMiddleware } from '../middlewares/auth.middleware';
import { CronsController } from './crons.controller';
import { Cron } from './crons.entity';
import { CronsService } from './crons.service';

@Module({
  imports: [TypeOrmModule.forFeature([Cron])],
  providers: [CronsService],
  controllers: [CronsController],
})
export class CronsModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(CronsController);
  }
}
