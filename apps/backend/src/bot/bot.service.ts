import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createLog } from '@vera-reforged/common';

import { VK } from 'vk-io';

import { IEnvironment } from '../environments/env-type';
import { logFS } from '../logger/log-fs';

@Injectable()
export class BotService {
  public readonly vk: VK;

  public constructor(
    @Inject(ConfigService) private readonly config: ConfigService,
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

    const debugChatId =
      this.config.get<IEnvironment['debugChatId']>('debugChatId');

    const logInitStatus = createLog('BotService: Bot was launched', {
      type: 'log',
    });
    logFS(logInitStatus);
    this.vk.api.messages.send({
      peer_id: debugChatId,
      message: logInitStatus,
      random_id: 0,
    });

    this.vk.updates.startPolling().catch((e) => {
      const logPollingError = createLog(`BotService: Polling error, ${e}`, {
        type: 'error',
      });
      logFS(logPollingError);

      this.vk.api.messages.send({
        peer_id: debugChatId,
        message: logPollingError,
        random_id: 0,
      });
    });
  }
}
