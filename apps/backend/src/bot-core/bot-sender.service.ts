import { Inject, Injectable } from '@nestjs/common';
import { getRandomId } from '@vera-reforged/common';
import { MessagesSendParams } from '@vkontakte/api-schema-typescript';

import { VkApiService } from '../vk-api/vk-api.service';
import { IBotSendOptions } from './bot-event.types';
import { TelegramApiService } from './telegram-api.service';

@Injectable()
export class BotSenderService {
  public constructor(
    @Inject(VkApiService) private readonly vkApi: VkApiService,
    @Inject(TelegramApiService)
    private readonly telegramApi: TelegramApiService,
  ) {}

  public async send(
    backend: 'vk' | 'telegram',
    peerId: number,
    message: string,
    opts?: IBotSendOptions,
  ): Promise<void> {
    if (backend === 'vk') {
      const params: MessagesSendParams & { group_id: number } = {
        peer_id: peerId,
        message,
        random_id: getRandomId(),
        group_id: 1,
      };

      if (opts?.replyToConversationMessageId) {
        params.forward = JSON.stringify({
          peer_id: peerId,
          is_reply: true,
          conversation_message_ids: opts.replyToConversationMessageId,
        });
      }

      await this.vkApi.fetch('messages.send', params, { retries: 3 });
    } else {
      await this.telegramApi.sendMessage(peerId, message, {
        replyToMessageId: opts?.replyToConversationMessageId,
      });
    }
  }
}
