import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { GreetingModule } from '../greeting/greeting.module';
import { MeetingModule } from '../meeting/meeting.module';
import { BotModule } from './bot.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/vera'),
    MeetingModule,
    GreetingModule,
    BotModule,
  ],
})
export class AppModule {}
