import { Injectable } from '@nestjs/common';
import { HearManager } from '@vk-io/hear';

import { VK } from 'vk-io';

@Injectable()
export class ApiService {
  private readonly vk: VK;
  private readonly bot: HearManager<undefined>;

  public constructor() {
    this.vk = new VK({
      token: process.env.BOT_TOKEN,
      pollingGroupId: 900028,
      apiMode: 'parallel',
    });

    this.bot = new HearManager();

    this.vk.updates.on('message_new', this.bot.middleware);

    this.vk.updates.startPolling().catch((e) => {
      console.error(e);
    });
  }

  public async getConversations() {
    return this.call('messages.getConversations', {
      filter: 'all',
      count: 200,
    });
  }

  public async getConversationsById() {
    return this.call('messages.getConversationsById', {
      peer_ids: [
        900002, 900005, 900003, 900035, 900008, 900025, 900004,
        900026, 900009, 900012, 900001, 900033, 900007, 900013,
        900027, 900015, 900029, 900039, 900030, 2000010042,
        2000010044, 2000010047, 2000010041, 2000010046, 2000010048, 2000010049,
        900040,
      ].join(','),
    });
  }

  public async getConversationMembers(peerId: number) {
    return this.call('messages.getConversationMembers', {
      peer_id: peerId,
    });
  }

  private call(method: string, params: object) {
    return this.vk.api.call(method, {
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
