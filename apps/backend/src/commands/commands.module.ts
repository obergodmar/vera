import { MiddlewareConsumer, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthMiddleware } from '../middlewares/auth.middleware';
import { CommandsController } from './commands.controller';
import { Command, RollCommand } from './commands.entity';
import { CommandsService } from './commands.service';

@Module({
  imports: [TypeOrmModule.forFeature([Command, RollCommand])],
  controllers: [CommandsController],
  providers: [CommandsService],
})
export class CommandsModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(CommandsController);
  }
}
