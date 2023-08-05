import { Global, Module } from '@nestjs/common';

import { VkApiService } from './vk-api.service';

@Global()
@Module({
  imports: [],
  providers: [VkApiService],
  exports: [VkApiService],
})
export class VkApiModule {}
