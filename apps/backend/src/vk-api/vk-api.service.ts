import { Inject, Injectable } from '@nestjs/common';

import {
  BaseUserGroupFields,
  UsersFields,
} from 'vk-io/lib/api/schemas/objects';
import { MessagesSendParams } from 'vk-io/lib/api/schemas/params';
import {
  MessagesGetConversationMembersResponse,
  MessagesGetConversationsByIdResponse,
  MessagesSendResponse,
  UsersGetResponse,
} from 'vk-io/lib/api/schemas/responses';

import { BotService } from '../bot/bot.service';

const defaultGroupFields: BaseUserGroupFields[] = [
  'id',
  'name',
  'screen_name',
  'type',
  'photo_50',
  'photo_100',
  'photo_200',
];

const defaultUserFields: UsersFields[] = [
  'screen_name',
  'photo_50',
  'photo_100',
  'photo_200',
];

@Injectable()
export class VkApiService {
  public constructor(
    @Inject(BotService) public readonly botService: BotService,
  ) {}

  public async getConversationsById(
    peerIds: number[],
  ): Promise<MessagesGetConversationsByIdResponse> {
    return this.botService.vk.api.messages.getConversationsById({
      peer_ids: peerIds,
      fields: defaultGroupFields,
    });
  }

  public async getConversationMembers(
    chatId: number,
  ): Promise<MessagesGetConversationMembersResponse> {
    return this.botService.vk.api.messages.getConversationMembers({
      peer_id: chatId,
      fields: defaultUserFields,
    });
  }

  public async getUsers(peerIds: number[]): Promise<UsersGetResponse> {
    return this.botService.vk.api.users.get({
      user_ids: peerIds,
      fields: defaultUserFields,
    });
  }

  public async sendMessage(
    params: MessagesSendParams,
  ): Promise<MessagesSendResponse> {
    return this.botService.vk.api.messages.send({
      random_id: 0,
      ...params,
    });
  }
}
