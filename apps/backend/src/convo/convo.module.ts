import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LoggerModule } from '../logger/logger.module';
import { VkApiModule } from '../vk-api/vk-api.module';
import { Convo } from './convo.entity';
import { ConvoService } from './convo.service';

@Module({
  imports: [VkApiModule, LoggerModule, TypeOrmModule.forFeature([Convo])],
  providers: [ConvoService],
  exports: [TypeOrmModule, ConvoService],
})
export class ConvoModule {}
