import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  filterIds,
  getChunkedArray,
  IApi,
  measure,
} from '@vera-reforged/common';
import {
  MessagesConversation,
  MessagesGetConversationByIdExtended,
  MessagesGetConversationMembersResponse,
} from '@vkontakte/api-schema-typescript';

import { Request } from 'express';
import { SessionData } from 'express-session';
import { UsersUser } from 'vk-io/lib/api/schemas/objects';

import { IEnvironment } from '../environments/env-type';
import { DebugService } from '../logger/debug.service';
import { LoggerService } from '../logger/logger.service';
import { SettingsService } from '../settings/settings.service';
import { EXECUTE_MAX_REQUESTS } from '../vk-api/config';
import { VkApiService } from '../vk-api/vk-api.service';

@Injectable()
export class ConvoService {
  private readonly logger: DebugService;

  private readonly adminChatId: number;

  public constructor(
    @Inject(VkApiService) private readonly vkApi: VkApiService,
    @Inject(ConfigService) private readonly config: ConfigService,
    @Inject(SettingsService) private readonly settings: SettingsService,
    @Inject(LoggerService) loggerService: LoggerService,
  ) {
    this.logger = new DebugService(loggerService, this.constructor.name);

    this.adminChatId =
      this.config.get<IEnvironment['adminChatId']>('adminChatId');
  }

  public async getChats(req: Request): Promise<IApi.ConversationsList> {
    const { sessionStore, session } = req;

    let currentUser: UsersUser;
    try {
      ({ user: currentUser } = await new Promise<SessionData>(
        (resolve, reject) => {
          sessionStore.get(session.id, (err, existingSession) => {
            if (err) {
              return reject(err);
            }

            if (!existingSession) {
              return reject('Session was not found');
            }

            return resolve(existingSession);
          });
        },
      ));
    } catch (error) {
      this.logger.error(error);

      sessionStore.destroy(session.id, (err) => {
        this.logger.error(`Could not destroy session: ${err}`);
      });
    }

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
    const authChatId =
      this.config.get<IEnvironment['authChatId']>('authChatId');
    const adminChatId =
      this.config.get<IEnvironment['adminChatId']>('adminChatId');

    const omitChats = [
      settingsChatId,
      errorChatId,
      debugChatId,
      authChatId,
      adminChatId,
    ];

    let items: MessagesConversation[] = [];
    try {
      const ids = [...Array(convosAmount).keys()].map((i) => i + 1 + 2e9);

      const convosToFetch = ids.filter(filterIds(omitChats));
      const chunkedConvos = getChunkedArray(
        EXECUTE_MAX_REQUESTS,
        convosToFetch,
      );

      const requests = chunkedConvos.reduce(
        (acc: Promise<MessagesGetConversationByIdExtended[]>[], chunk) => {
          return [
            ...acc,
            this.vkApi.fetchMany(
              chunk.map((peerId) => ({
                method: 'messages.getConversationsById',
                params: {
                  group_id: 1,
                  extended: 0,
                  peer_ids: `${peerId}`,
                },
              })),
            ),
          ];
        },
        [],
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
          items = [...items, arrayItems[0]];
        }
      });
    } catch (error: unknown) {
      this.logger.error(`fetching convos: ${error}`);

      return {
        count: 0,
        items: [],
      };
    }

    try {
      const chatMembers = await this.vkApi.fetch(
        'messages.getConversationMembers',
        {
          group_id: 1,
          peer_id: this.adminChatId,
          // extended: 0,
        },
        {
          retries: 3,
        },
      );

      if (
        chatMembers.items.find(
          ({ member_id: memberId }) => memberId === currentUser.id,
        )
      ) {
        const callTime = finish(point);
        this.logger.debug(
          `Loaded ${items.length} conversations without members. Took ${callTime} ms`,
        );

        return {
          count: items.length,
          items: items,
        };
      }
    } catch (error: unknown) {
      this.logger.error(`get admin chat members: ${error}`);

      return {
        count: 0,
        items: [],
      };
    }

    try {
      const chunkedConvos = getChunkedArray(EXECUTE_MAX_REQUESTS, items);
      const memberRequests = chunkedConvos.reduce(
        (acc: Promise<MessagesGetConversationMembersResponse[]>[], chunk) => [
          ...acc,
          this.vkApi.fetchMany(
            chunk.map(({ peer: { id: peerId } }) => ({
              method: 'messages.getConversationMembers',
              params: {
                group_id: 1,
                // extended: 0,
                peer_id: peerId,
              },
            })),
          ),
        ],
        [],
      );

      const ownItems: MessagesConversation[] = [];

      const membersResponses = await Promise.allSettled(memberRequests);
      membersResponses.forEach((promise, chankId) => {
        if (promise.status === 'fulfilled') {
          promise.value.forEach((response, convoId) => {
            if (
              (response?.items || []).find(
                ({ member_id: memberId }) => memberId === currentUser.id,
              )
            ) {
              const convo = chunkedConvos[chankId]?.[convoId];
              if (convo) {
                ownItems.push(convo);
              }
            }
          });
        }
      });

      const callTime = finish(point);
      this.logger.debug(
        `Loaded ${ownItems.length} conversations with members. Took ${callTime} ms`,
      );

      return {
        count: ownItems.length,
        items: ownItems,
      };
    } catch (error: unknown) {
      this.logger.error(`get members for all chats: ${error}`);

      return {
        count: 0,
        items: [],
      };
    }
  }
}
