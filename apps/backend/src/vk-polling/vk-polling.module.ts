import { Module } from '@nestjs/common';

import { VkPollingService } from './vk-polling.service';

@Module({
  providers: [VkPollingService],
})
export class VkPollingModule {}
