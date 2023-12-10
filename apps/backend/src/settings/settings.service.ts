import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { MessageContext } from 'vk-io';

import { IEnvironment } from '../environments/env-type';
import { DebugService } from '../logger/debug.service';
import { LoggerService } from '../logger/logger.service';
import { VkApiService } from '../vk-api/vk-api.service';
import { Setting } from './settings.entity';

@Injectable()
export class SettingsService {
  private readonly logger: DebugService;

  public constructor(
    @InjectRepository(Setting)
    private readonly settingsRepository: Repository<Setting>,
    @Inject(VkApiService) private readonly api: VkApiService,
    @Inject(ConfigService) private readonly config: ConfigService,
    @Inject(LoggerService) loggerService: LoggerService,
  ) {
    this.logger = new DebugService(loggerService, this.constructor.name);

    const settingsChatId =
      this.config.get<IEnvironment['settingsChatId']>('settingsChatId');

    this.api.botService.vk.updates.on(
      'message_new',
      async (msg: MessageContext) => {
        const { text } = msg;

        // this.api.botService.vk.api.messages.send({});
      },
    );
  }
}
