import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { MeetingModule } from '../meeting/meeting.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/vera'),
    MeetingModule,
  ],
})
export class AppModule {}
