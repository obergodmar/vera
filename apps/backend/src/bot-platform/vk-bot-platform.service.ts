import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  BotChatList,
  BotChatMembers,
  BotUser,
  filterIds,
  getChunkedArray,
  getRandomId,
  IApi,
} from '@vera-reforged/common';
import {
  MessagesGetConversationByIdExtended,
  MessagesGetConversationMembersResponse,
  UsersUserFull,
} from '@vkontakte/api-schema-typescript';

import { IEnvironment } from '../environments/env-type';
import { DebugService } from '../logger/debug.service';
import { LoggerService } from '../logger/logger.service';
import { SettingsService } from '../settings/settings.service';
import { EXECUTE_MAX_REQUESTS } from '../vk-api/config';
import { VkApiService } from '../vk-api/vk-api.service';
import { request } from '../vk-api/request';
import { IBotPlatform, IBotSendOptions } from './IBotPlatform';

@Injectable()
export class VkBotPlatformService implements IBotPlatform {
  readonly platform = 'vk' as const;

  private readonly logger: DebugService;
  private readonly adminChatId: number;
  private readonly settingsChatId: number;
  private readonly errorChatId: number;
  private readonly debugChatId: number;
  private readonly authChatId: number;

  public constructor(
    @Inject(VkApiService) private readonly vkApi: VkApiService,
    @Inject(ConfigService) private readonly config: ConfigService,
    @Inject(SettingsService) private readonly settings: SettingsService,
    @Inject(LoggerService) loggerService: LoggerService,
  ) {
    this.logger = new DebugService(loggerService, this.constructor.name);
    this.adminChatId = config.get<IEnvironment['adminChatId']>('adminChatId');
    this.settingsChatId =
      config.get<IEnvironment['settingsChatId']>('settingsChatId');
    this.errorChatId = config.get<IEnvironment['errorChatId']>('errorChatId');
    this.debugChatId = config.get<IEnvironment['debugChatId']>('debugChatId');
    this.authChatId = config.get<IEnvironment['authChatId']>('authChatId');
  }

  public async sendMessage(
    peerId: number,
    text: string,
    opts?: IBotSendOptions,
  ): Promise<void> {
    const params: Record<string, unknown> = {
      peer_id: peerId,
      message: text,
      random_id: getRandomId(),
      group_id: 1,
    };

    if (opts?.replyToMessageId) {
      params.forward = JSON.stringify({
        peer_id: peerId,
        is_reply: true,
        conversation_message_ids: opts.replyToMessageId,
      });
    }

    if (opts?.linkButtons?.length) {
      const [{ label, link }] = opts.linkButtons;
      if (label && link) {
        params.keyboard = JSON.stringify({
          inline: true,
          buttons: [[{ action: { type: 'open_link', link, label } }]],
        });
      }
    }

    await this.vkApi.fetch('messages.send', params as any, { retries: 3 });
  }

  public async getChats(userId: number): Promise<BotChatList> {
    const convosAmount = await this.settings.get('convos_fetch_amount');
    this.logger.debug(
      `Fetching ${convosAmount} conversations for user ${userId}`,
    );

    const omitChats = [
      this.settingsChatId,
      this.errorChatId,
      this.debugChatId,
      this.authChatId,
      this.adminChatId,
    ];

    let items: MessagesGetConversationByIdExtended[] = [];
    try {
      const ids = [...Array(convosAmount).keys()].map((i) => i + 1 + 2e9);
      const convosToFetch = ids.filter(filterIds(omitChats));
      const chunkedConvos = getChunkedArray(
        EXECUTE_MAX_REQUESTS,
        convosToFetch,
      );

      const requests = chunkedConvos.map((chunk) =>
        this.vkApi.fetchMany(
          chunk.map((peerId) => ({
            method: 'messages.getConversationsById',
            params: { group_id: 1, extended: 0, peer_ids: `${peerId}` },
          })),
          { omitExecuteLogs: true },
        ),
      );

      const responses = await Promise.allSettled(requests);
      const convos: MessagesGetConversationByIdExtended[] = responses.reduce(
        (acc, promise) => {
          if (promise.status === 'fulfilled') {
            return [...acc, ...promise.value];
          }
          return acc;
        },
        [],
      );

      convos.forEach(({ items: arrayItems }) => {
        if (Array.isArray(arrayItems) && arrayItems[0]) {
          items = [...items, arrayItems[0] as any];
        }
      });
    } catch (error: unknown) {
      this.logger.error(`getChats fetchConvos: ${error}`);
      return { count: 0, items: [] };
    }

    try {
      const chatMembers = await this.vkApi.fetch(
        'messages.getConversationMembers',
        { group_id: 1, peer_id: this.adminChatId, extended: 0 },
        { retries: 3 },
      );

      if (
        chatMembers.items.find(({ member_id: memberId }) => memberId === userId)
      ) {
        return {
          count: items.length,
          items: items.map((convo: any) => ({
            id: convo.peer?.id ?? convo.id,
            title: convo.chat_settings?.title ?? '',
            photo: convo.chat_settings?.photo?.photo_100,
          })),
        };
      }
    } catch (error: unknown) {
      this.logger.error(`getChats adminCheck: ${error}`);
      return { count: 0, items: [] };
    }

    try {
      const chunkedConvos = getChunkedArray(EXECUTE_MAX_REQUESTS, items);
      const memberRequests = chunkedConvos.map((chunk) =>
        this.vkApi.fetchMany(
          (chunk as any[]).map(({ peer: { id: peerId } }: any) => ({
            method: 'messages.getConversationMembers',
            params: { group_id: 1, extended: 0, peer_id: peerId },
          })),
        ),
      );

      const ownItems: MessagesGetConversationByIdExtended[] = [];
      const membersResponses = await Promise.allSettled(memberRequests);

      membersResponses.forEach((promise, chunkId) => {
        if (promise.status === 'fulfilled') {
          (promise.value as MessagesGetConversationMembersResponse[]).forEach(
            (response, convoId) => {
              if (
                (response?.items || []).find(
                  ({ member_id: memberId }) => memberId === userId,
                )
              ) {
                const convo = chunkedConvos[chunkId]?.[convoId];
                if (convo) {
                  ownItems.push(convo as any);
                }
              }
            },
          );
        }
      });

      return {
        count: ownItems.length,
        items: ownItems.map((convo: any) => ({
          id: convo.peer?.id ?? convo.id,
          title: convo.chat_settings?.title ?? '',
          photo: convo.chat_settings?.photo?.photo_100,
        })),
      };
    } catch (error: unknown) {
      this.logger.error(`getChats memberFilter: ${error}`);
      return { count: 0, items: [] };
    }
  }

  public async getChatMembers(chatId: number): Promise<BotChatMembers> {
    try {
      const response: MessagesGetConversationMembersResponse =
        await this.vkApi.fetch(
          'messages.getConversationMembers',
          { extended: 0, peer_id: chatId, group_id: 1 },
          { retries: 3 },
        );

      return {
        count: response.count ?? 0,
        items: ((response.profiles as UsersUserFull[]) || []).map((user) =>
          vkUserToBotUser(user),
        ),
      };
    } catch (error: unknown) {
      this.logger.error(`getChatMembers: ${error}`);
      return { count: 0, items: [] };
    }
  }

  public async getUsers(userIds: number[]): Promise<BotUser[]> {
    if (userIds.length === 0) return [];
    try {
      const users: UsersUserFull[] = await this.vkApi.fetch(
        'users.get',
        { user_ids: userIds.join(',') },
        { retries: 3 },
      );
      return users.map((user) => vkUserToBotUser(user));
    } catch (error: unknown) {
      this.logger.error(`getUsers: ${error}`);
      return [];
    }
  }

  public async isMember(chatId: number, userId: number): Promise<boolean> {
    try {
      const chatMembers = await this.vkApi.fetch(
        'messages.getConversationMembers',
        { group_id: 1, peer_id: chatId, extended: 0 },
        { retries: 3 },
      );
      return !!chatMembers.items.find(
        ({ member_id: memberId }) => memberId === userId,
      );
    } catch (error: unknown) {
      this.logger.error(`isMember: ${error}`);
      return false;
    }
  }

  public async authorizeUser(
    data: IApi.IAuthApi.VkAuthData | IApi.IAuthApi.TelegramAuthData,
  ): Promise<{ user: BotUser; token: string } | null> {
    const vkData = data as IApi.IAuthApi.VkAuthData;
    const { code, code_verifier, device_id } = vkData;

    const appId = this.config.get<IEnvironment['appId']>('appId');
    const redirectUri =
      this.config.get<IEnvironment['redirectUri']>('redirectUri');

    try {
      const res = await request('https://id.vk.ru/oauth2/auth', {
        client_id: appId,
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        code_verifier,
        device_id,
      });

      const accessToken = res.access_token;
      const userResponse: UsersUserFull[] = await this.vkApi.fetchWithUserToken(
        'users.get',
        { access_token: accessToken },
        { retries: 3 },
      );

      const requestedUser = userResponse[0];
      if (!requestedUser) return null;

      return {
        token: accessToken,
        user: vkUserToBotUser(requestedUser),
      };
    } catch (error: unknown) {
      this.logger.error(`authorizeUser: ${error}`);
      return null;
    }
  }

  public async validateToken(token: string, userId: number): Promise<boolean> {
    try {
      const userResponse: UsersUserFull[] = await this.vkApi.fetchWithUserToken(
        'users.get',
        { access_token: token },
      );
      const user = userResponse[0];
      return !!user && user.id === userId;
    } catch {
      return false;
    }
  }
}

function vkUserToBotUser(user: UsersUserFull): BotUser {
  return {
    id: user.id,
    firstName: user.first_name,
    lastName: user.last_name,
    username: user.screen_name,
    photo: user.photo_100 ?? user.photo_50,
    mention: user.screen_name
      ? `@${user.screen_name}`
      : `@id${user.id} (${user.first_name})`,
  };
}
