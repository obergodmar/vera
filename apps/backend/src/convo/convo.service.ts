import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import {
  filterByGroupChat,
  filterIds,
  IApi,
  isGroupChat,
} from '@vera-reforged/common';

import { Repository } from 'typeorm';
import { MessageContext } from 'vk-io';

import { IEnvironment } from '../environments/env-type';
import { DebugService } from '../logger/debug.service';
import { LoggerService } from '../logger/logger.service';
import { VkApiService } from '../vk-api/vk-api.service';
import { Convo } from './convo.entity';

@Injectable()
export class ConvoService {
  private readonly logger: DebugService;

  public constructor(
    @InjectRepository(Convo)
    private readonly convoRepository: Repository<Convo>,
    @Inject(VkApiService) private readonly api: VkApiService,
    @Inject(ConfigService) private readonly config: ConfigService,
    @Inject(LoggerService) loggerService: LoggerService,
  ) {
    this.logger = new DebugService(loggerService, this.constructor.name);

    this.api.botService.vk.updates.on(
      'message_new',
      async (msg: MessageContext) => {
        const { peerId, peerType } = msg;

        this.updateConvoDb.call(this, peerType, peerId);
      },
    );
  }

  private async updateConvoDb(peerType: string, peerId: number) {
    if (!isGroupChat(peerType)) {
      this.logger.debug(`Vera mentioned in ${peerId}`);
      return;
    }

    this.logger.debug(`Vera conversations update requested in ${peerId}`);

    try {
      await this.convoRepository.insert({ id: peerId });
      this.logger.debug(`Convo ${peerId} is loaded`);
    } catch (e: unknown) {
      if (
        typeof e === 'object' &&
        'code' in e &&
        e['code'] === 'ER_DUP_ENTRY'
      ) {
        this.logger.debug(`Convo ${peerId} is already loaded`);
      } else {
        this.logger.error(`Load convo ${peerId} to convo db: ${e}`);
      }
    }
  }

  public async getChats(): Promise<IApi.ConversationsList> {
    let convoIds: number[] = [];

    this.logger.debug('Vera chats requested');

    const settingsChatId =
      this.config.get<IEnvironment['settingsChatId']>('settingsChatId');
    const errorChatId =
      this.config.get<IEnvironment['errorChatId']>('errorChatId');
    const debugChatId =
      this.config.get<IEnvironment['debugChatId']>('debugChatId');

    const omitChats = [settingsChatId, errorChatId, debugChatId];

    try {
      const convos = await this.convoRepository.find();

      convoIds = convos.map((convo) => convo.id).filter(filterIds(omitChats));
    } catch (e) {
      this.logger.error(`Convo repository error: ${e}`);
    }

    if (!convoIds.length) {
      return {
        count: 0,
        items: [],
      };
    }

    const chats = await this.api.getConversationsById(convoIds);
    const items = filterByGroupChat(chats.items);

    return {
      count: items.length,
      items,
    };
  }
}
