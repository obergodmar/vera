import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createLog } from '@vera-reforged/common';

import { BotService } from '../bot/bot.service';
import { IEnvironment } from '../environments/env-type';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class LoggerService {
  public constructor(
    @Inject(BotService) private readonly bot: BotService,
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

  private sendLog(message: string, peerId: number): void {
    this.bot.vk.api.messages.send({
      peer_id: peerId,
      message,
      random_id: 0,
    });
  }
}
