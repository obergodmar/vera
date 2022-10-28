import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Greeting, GreetingSchema } from '../greeting/schemes/greeting.schema';
import { Meeting, MeetingSchema } from '../meeting/schemes/meeting.schema';
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
    MongooseModule.forFeature([
      {
        name: Meeting.name,
        schema: MeetingSchema,
      },
    ]),
  ],
  providers: [BotService],
  exports: [BotService],
})
export class BotModule {}
