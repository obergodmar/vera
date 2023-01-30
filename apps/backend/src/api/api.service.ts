import { Inject, Injectable } from '@nestjs/common';
import { Duties } from '@vera-reforged/common';

import { BotService } from '../bot/bot.service';
import { getConfig, writeConfig } from '../utils/getConfig';

@Injectable()
export class ApiService {
  public constructor(
    @Inject(BotService) private readonly botService: BotService
  ) {}
  public async getConversations() {
    return this.call('messages.getConversations', {
      filter: 'all',
      count: 200,
    });
  }

  public async getConversationsById() {
    const config = await getConfig();
    const { duties } = config;

    return this.call('messages.getConversationsById', {
      peer_ids: duties.chats.join(','),
    });
  }

  public async getConversationMembers(peerId: number) {
    return this.call('messages.getConversationMembers', {
      peer_id: peerId,
    });
  }

  public async updateDutiesSchedule(peerId: number, duties: Duties) {
    const config = await getConfig();

    config.duties.schedule[peerId] = duties;

    const status = writeConfig(config);

    if (status) {
      return {
        success: true,
      };
    }

    return {
      error: 'Ошибка записи файла',
    };
  }

  public async getAppConfig() {
    return getConfig();
  }

  private call(method: string, params: object) {
    return this.botService.vk.api.call(method, {
      group_id: 900028,
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
