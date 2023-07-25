import { MiddlewareConsumer, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConvoModule } from '../convo/convo.module';
import { Reaction } from './reactions.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Reaction]), ConvoModule],
})
export class ReactionsModule {
  // configure(consumer: MiddlewareConsumer) {}
}
