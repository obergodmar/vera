import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IApi } from '@vera-reforged/common';

import { Repository } from 'typeorm';

import { ConvoService } from '../convo/convo.service';
import { LoggerService } from '../logger/logger.service';
import { VkApiService } from '../vk-api/vk-api.service';
import { HelloMessage } from './hello-messages.entity';

@Injectable()
export class HelloMessagesService {
  public constructor(
    @InjectRepository(HelloMessage)
    private readonly hlRepository: Repository<HelloMessage>,
    @Inject(VkApiService) private readonly api: VkApiService,
    @Inject(LoggerService) private readonly logger: LoggerService,
    @Inject(ConvoService) private readonly convoService: ConvoService
  ) {}

  public async getHelloMessages(): Promise<IApi.IHelloMessagesApi.GetHelloMessagesResponse> {
    this.logger.log('HelloMessagesService : hello messages were requested');

    const messages = await this.hlRepository.find();
    const convos = await this.convoService.getChats();

    const convosWithMessages = messages.reduce(
      (
        chats: IApi.IHelloMessagesApi.ConvoListWithMessages[],
        { chatId, message }
      ) => {
        const chat = convos.items.find((chat) => chat.peer.id === chatId);

        if (chat) {
          chats.push({
            ...chat,
            helloMessage: message,
          });
        }

        return chats;
      },
      []
    );

    return {
      count: convosWithMessages.length,
      items: convosWithMessages,
    };
  }

  public async updateHelloMessage(
    chatId: number,
    message: string
  ): Promise<IApi.StatusResponse> {
    this.logger.log(
      `HelloMessagesService: Setting message ${message} to chat ${chatId}`
    );

    try {
      await this.hlRepository.upsert([{ chatId, message }], ['message']);
    } catch (e) {
      this.logger.log(
        `HelloMessagesService: Error upserting new message into ${chatId}: ${e}`,
        { type: 'error' }
      );
      return {
        error: JSON.stringify(e),
        success: false,
      };
    }

    return {
      success: true,
    };
  }
}
