import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createLog, VIM } from '@vera-reforged/common';
import { HearManager } from '@vk-io/hear';

import { VK } from 'vk-io';

import { IEnvironment } from '../environments/env-type';
import { logFS } from '../logger/log-fs';

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

    const logInitStatus = createLog('[BotService]: Bot was launched');
    logFS(logInitStatus);
    this.vk.api.messages.send({
      peer_id: VIM,
      message: logInitStatus,
      random_id: 0,
    });

    this.vk.updates.startPolling().catch((e) => {
      const logPollingError = createLog(`[BotService]: Polling error, ${e}`, {
        type: 'error',
      });
      logFS(logPollingError);

      this.vk.api.messages.send({
        peer_id: VIM,
        message: logPollingError,
        random_id: 0,
      });
    });
  }
}
