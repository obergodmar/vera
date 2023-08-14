import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { filterByGroupChat, IApi, isGroupChat } from '@vera-reforged/common';

import { Repository } from 'typeorm';
import { MessageContext } from 'vk-io';

import { LoggerService } from '../logger/logger.service';
import { VkApiService } from '../vk-api/vk-api.service';
import { Convo } from './convo.entity';

@Injectable()
export class ConvoService {
  public constructor(
    @InjectRepository(Convo)
    private readonly convoRepository: Repository<Convo>,
    @Inject(VkApiService) private readonly api: VkApiService,
    @Inject(LoggerService) private readonly logger: LoggerService
  ) {
    const handleMention = (msg: MessageContext) => {
      const { peerId, peerType } = msg;

      this.updateConvoDb.call(this, peerType, peerId);
    };

    this.api.botService.bot.hear(/^Вера$/i, handleMention);
    this.api.botService.bot.hear(/^@?club900028$/, handleMention);
  }

  private async updateConvoDb(peerType: string, peerId: number) {
    if (!isGroupChat(peerType)) {
      this.logger.log(`ConvoService: Vera mentioned in ${peerId}`);
      return;
    }

    this.logger.log(
      `ConvoService: Vera conversations update requestd in ${peerId}`
    );

    try {
      await this.convoRepository.insert({ id: peerId });
      this.logger.log(`ConvoService: Convo ${peerId} is loaded`);
    } catch (e: unknown) {
      if (
        typeof e === 'object' &&
        'code' in e &&
        e['code'] === 'ER_DUP_ENTRY'
      ) {
        this.logger.log(`ConvoService: Convo ${peerId} is already loaded`);
      } else {
        this.logger.log(
          `ConvoService: Load convo ${peerId} to convo db: ${e}`,
          {
            type: 'error',
          }
        );
      }
    }
  }

  public async getChats(): Promise<IApi.ConversationsList> {
    let convoIds: number[] = [];

    this.logger.log('ConvoService: Vera chats requested');

    try {
      const convos = await this.convoRepository.find();

      convoIds = convos.map((convo) => convo.id);
    } catch (e) {
      this.logger.log(`ConvoService: convoRepository error: ${e}`, {
        type: 'error',
      });
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
