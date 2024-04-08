import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { filterIds, IApi, measure } from '@vera-reforged/common';

import { MessagesConversation } from 'vk-io/lib/api/schemas/objects';

import { BotService } from '../bot/bot.service';
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

    const items = []
    try {
      const ids = [...Array(convosAmount).keys()].map((i) => i + 1 + 2e9);

      const convosToFetch = ids.filter(filterIds(omitChats));

      const responses = this.api.fetchMany(
        convosToFetch.map((peerId) => ({
          method: 'messages.getConversationsById',
          params: {
            group_id: 1,
            extended: 1,
            peer_ids: `${peerId}`,
          },
        })),
      );

      console.log(responses)
      // await Promise.allSettled(convosPromises).then((results) => {
      //   results.forEach((result) => {
      //     if (result.status === 'fulfilled') {
      //       result.value.items.forEach((item) => {
      //         items.set(item.peer.id, item);
      //       });
      //     }
      //   });
      // });
    } catch {
      // Chat doesn't exist
    }

    // const membersPromises = Array.from(items.values()).map(({ peer: { id } }) =>
    //   this.api.getConversationMembers(id).then((result) => ({
    //     result,
    //     chatId: id,
    //   })),
    // );
    //
    // let realItems: MessagesConversation[] = [];
    // await Promise.allSettled(membersPromises).then((results) => {
    //   results.forEach((result) => {
    //     if (result.status === 'fulfilled') {
    //       if (
    //         result.value.result.items.find(
    //           ({ member_id }) => member_id === 900033,
    //         )
    //       ) {
    //         realItems = [...realItems, items.get(result.value.chatId)];
    //       }
    //     }
    //   });
    // });

    const callTime = finish(point);
    this.logger.debug(
      `Loaded ${items.length} conversations. Took ${callTime} ms`,
    );

    return {
      count: items.length,
      items: items,
    };
  }
}
