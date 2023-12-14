import { Inject, Injectable, Logger } from '@nestjs/common';
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
    const errorChatId =
      this.config.get<IEnvironment['errorChatId']>('errorChatId');

    const message = 'BotService: Bot was launched';
    const logInitStatus = createLog(message, {
      type: 'log',
    });
    logFS(logInitStatus);
    this.vk.api.messages.send({
      peer_id: debugChatId,
      message: logInitStatus,
      random_id: 0,
    });
    Logger.log(message);

    this.vk.updates.startPolling().catch((e) => {
      const error = `BotService: Polling error, ${e}`;
      const logPollingError = createLog(error, {
        type: 'error',
      });
      logFS(logPollingError);
      Logger.error(error);

      this.vk.api.messages.send({
        peer_id: errorChatId,
        message: logPollingError,
        random_id: 0,
      });
    });
  }
}
