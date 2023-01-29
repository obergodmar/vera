import { Injectable } from '@nestjs/common';
import { HearManager } from '@vk-io/hear';

import { VK } from 'vk-io';

@Injectable()
export class BotService {
  public readonly vk: VK;
  public readonly bot: HearManager<undefined>;

  public constructor() {
    this.vk = new VK({
      token: process.env.BOT_TOKEN,
      pollingGroupId: 900028,
      apiMode: 'parallel',
    });

    this.bot = new HearManager();

    this.vk.updates.on('message_new', this.bot.middleware);

    this.vk.updates.startPolling().catch((e) => {
      console.error(e);
    });
  }
}
