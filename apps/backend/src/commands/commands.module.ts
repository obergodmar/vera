import { MiddlewareConsumer, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConvoModule } from '../convo/convo.module';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import { CommandsController } from './commands.controller';
import { Command, RollCommand } from './commands.entity';
import { CommandsService } from './commands.service';

@Module({
  imports: [TypeOrmModule.forFeature([Command, RollCommand]), ConvoModule],
  controllers: [CommandsController],
  providers: [CommandsService],
})
export class CommandsModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(CommandsController);
  }
}
