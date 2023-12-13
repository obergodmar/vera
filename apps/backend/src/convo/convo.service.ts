import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { filterIds, IApi, measure } from '@vera-reforged/common';

import { MessagesConversation } from 'vk-io/lib/api/schemas/objects';

import { IEnvironment } from '../environments/env-type';
import { DebugService } from '../logger/debug.service';
import { LoggerService } from '../logger/logger.service';
import { SettingsService } from '../settings/settings.service';
import { VkApiService } from '../vk-api/vk-api.service';

@Injectable()
export class ConvoService {
  private readonly logger: DebugService;

  public constructor(
    @Inject(VkApiService) private readonly api: VkApiService,
    @Inject(ConfigService) private readonly config: ConfigService,
    @Inject(SettingsService) private readonly settings: SettingsService,
    @Inject(LoggerService) loggerService: LoggerService,
  ) {
    this.logger = new DebugService(loggerService, this.constructor.name);
  }

  public async getChats(): Promise<IApi.ConversationsList> {
    this.logger.debug('Vera chats requested');
    const { start, finish } = measure();
    const point = start();

    const convosAmount = await this.settings.get('convos_fetch_amount');
    this.logger.debug(`Fetching ${convosAmount} conversations`);

    const settingsChatId =
      this.config.get<IEnvironment['settingsChatId']>('settingsChatId');
    const errorChatId =
      this.config.get<IEnvironment['errorChatId']>('errorChatId');
    const debugChatId =
      this.config.get<IEnvironment['debugChatId']>('debugChatId');

    const omitChats = [settingsChatId, errorChatId, debugChatId];

    let items: MessagesConversation[] = [];
    try {
      const ids = [...Array(convosAmount).keys()].map((i) => i + 1 + 2e9);

      const convosPromises = ids
        .filter(filterIds(omitChats))
        .map(this.api.getConversationsById.bind(this.api));

      await Promise.allSettled(convosPromises).then((results) => {
        results.forEach((result) => {
          if (result.status === 'fulfilled') {
            items = [...items, ...(result.value.items || [])];
          }
        });
      });
    } catch {
      // Chat doesn't exist
    }

    const callTime = finish(point);
    this.logger.debug(
      `Loaded ${items.length} conversations. Took ${callTime} ms`,
    );

    return {
      count: items.length,
      items,
    };
  }
}
