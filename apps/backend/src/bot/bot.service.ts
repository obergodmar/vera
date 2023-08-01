import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HearManager } from '@vk-io/hear';

import { VK } from 'vk-io';

import { IEnvironment } from '../environments/env-type';

@Injectable()
export class BotService {
  public readonly vk: VK;
  public readonly bot: HearManager<undefined>;

  public constructor(
    @Inject(ConfigService) private readonly config: ConfigService
  ) {
    const token = this.config.get<IEnvironment['botToken']>('botToken');
    const pollingGroupId =
      this.config.get<IEnvironment['botPollingGroupId']>('botPollingGroupId');
    const apiMode = this.config.get<IEnvironment['botApiMode']>('botApiMode');

    this.vk = new VK({
      token,
      pollingGroupId,
      apiMode,
    });

    this.bot = new HearManager();

    this.vk.updates.on('message_new', this.bot.middleware);

    this.vk.updates.startPolling().catch((e) => {
      console.error(e);
    });
  }
}
