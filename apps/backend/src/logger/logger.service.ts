import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { createLog } from '@vera-reforged/common';

import { Repository } from 'typeorm';

import { BotService } from '../bot/bot.service';
import { IEnvironment } from '../environments/env-type';
import { Setting } from '../settings/settings.entity';

@Injectable()
export class LoggerService {
  public constructor(
    @InjectRepository(Setting)
    private readonly settingsRepository: Repository<Setting>,
    @Inject(BotService) private readonly bot: BotService,
    @Inject(ConfigService) private readonly config: ConfigService,
  ) {}

  public async debug(value: unknown): Promise<void> {
    const debugChatId =
      this.config.get<IEnvironment['debugChatId']>('debugChatId');

    let isDebugSendEnabled = false;
    try {
      const value = await this.settingsRepository.findOneBy({
        opt: 'debug_log_to_vk',
      });

      if (value) {
        isDebugSendEnabled = true;
      }

      if (isDebugSendEnabled) {
        const message = createLog(
          'LoggerService: Fetching settings repository',
          { type: 'debug' },
        );

        this.sendLog(message, debugChatId);
      }
    } catch (e) {
      this.error(`LoggerService: Failed to fetch settings repository: ${e}`);
    }

    const message = createLog(value, { type: 'debug' });
    if (isDebugSendEnabled) {
      this.sendLog(message, debugChatId);
    }
  }

  public error(value: unknown): void {
    const errorChatId =
      this.config.get<IEnvironment['errorChatId']>('errorChatId');

    const message = createLog(value, { type: 'error' });

    this.sendLog(message, errorChatId);
  }

  public log(value: unknown): void {
    const debugChatId =
      this.config.get<IEnvironment['debugChatId']>('debugChatId');

    const message = createLog(value, { type: 'log' });

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
