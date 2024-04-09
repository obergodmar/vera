import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createLog, getRandomId } from '@vera-reforged/common';

import { IEnvironment } from '../environments/env-type';
import { SettingsService } from '../settings/settings.service';
import { VkApiService } from '../vk-api/vk-api.service';

@Injectable()
export class LoggerService {
  public constructor(
    @Inject(VkApiService) private readonly vkApi: VkApiService,
    @Inject(ConfigService) private readonly config: ConfigService,
    @Inject(SettingsService) private readonly settings: SettingsService,
  ) {}

  public async debug(value: unknown): Promise<void> {
    const debugChatId =
      this.config.get<IEnvironment['debugChatId']>('debugChatId');

    const message = createLog(value, { type: 'debug' });
    Logger.debug(value);

    const isDebugSendEnabled = await this.settings.get('debug_log_to_vk');
    if (isDebugSendEnabled) {
      this.sendLog(message, debugChatId);
    }
  }

  public error(value: unknown): void {
    const errorChatId =
      this.config.get<IEnvironment['errorChatId']>('errorChatId');

    const message = createLog(value, { type: 'error' });

    Logger.error(value);
    this.sendLog(message, errorChatId);
  }

  public log(value: unknown): void {
    const debugChatId =
      this.config.get<IEnvironment['debugChatId']>('debugChatId');

    const message = createLog(value, { type: 'log' });

    Logger.log(value);
    this.sendLog(message, debugChatId);
  }

  public custom(where: 'auth', value: unknown): void {
    let chatId: number;
    switch (where) {
      case 'auth':
        chatId = this.config.get<IEnvironment['authChatId']>('authChatId');
        break;
      default:
        break;
    }

    const message = createLog(value, { type: 'log' });
    Logger.log(value);
    this.sendLog(message, chatId);
  }

  private sendLog(message: string, peerId: number): void {
    try {
      this.vkApi.fetch(
        'messages.send',
        {
          peer_id: peerId,
          message,
          group_id: 1,
          random_id: getRandomId(),
        },
        { retries: 3 },
      );
    } catch (e) {
      Logger.error(e);
    }
  }
}
