import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Greeting, GreetingSchema } from '../greeting/schemes/greeting.schema';
import { BotService } from './bot.service';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Greeting.name,
        schema: GreetingSchema,
      },
    ]),
  ],
  providers: [BotService],
  exports: [BotService],
})
export class BotModule {}
