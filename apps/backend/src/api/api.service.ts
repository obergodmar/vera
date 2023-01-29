import { Injectable } from '@nestjs/common';
import { Config, Duties } from '@vera-reforged/common';
import { HearManager } from '@vk-io/hear';

import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
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
    const config = (await import('../assets/config.json')) as Config;
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
    const config = (await import('../assets/config.json')) as Config;

    config.duties.schedule[peerId] = duties;

    try {
      writeFileSync(
        `${join(__dirname, 'assets')}/config.json`,
        JSON.stringify(config)
      );

      return {
        success: true,
      };
    } catch (e) {
      return {
        error: e,
      };
    }
  }

  public async getConfig() {
    return (await import('../assets/config.json')) as Config;
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
