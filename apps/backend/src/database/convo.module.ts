import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Convo } from './convo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Convo])],
  exports: [TypeOrmModule],
})
export class ConvoModule {}
