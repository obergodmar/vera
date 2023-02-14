import { Inject, Injectable } from '@nestjs/common';

import { BotService } from '../bot/bot.service';

@Injectable()
export class VkApiService {
  private readonly groupId = 900028;

  public constructor(
    @Inject(BotService) public readonly botService: BotService
  ) {}

  public async getConversationsById(peerIds: number[]) {
    return this.fetch('messages.getConversationsById', {
      peer_ids: peerIds.join(','),
    });
  }

  public async getConversationMembers(chatId: number) {
    return this.fetch('messages.getConversationMembers', {
      peer_id: chatId,
    });
  }

  private fetch(method: string, params: object) {
    return this.botService.vk.api.call(method, {
      group_id: this.groupId,
      fields: [
        'id',
        'name',
        'screen_name',
        'type',
        'photo_50',
        'photo_100',
        'photo_200',
      ],
      ...params,
    });
  }
}
