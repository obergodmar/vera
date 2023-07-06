import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { filterByGroupChat, IApi } from '@vera-reforged/common';

import { Repository } from 'typeorm';
import { MessagesConversation } from 'vk-io/lib/api/schemas/objects';

import { Convo } from '../database/convo.entity';
import { LoggerService } from '../logger/logger.service';
import { VkApiService } from '../vk-api/vk-api.service';
import { HelloMessage } from './hello-messages.entity';

@Injectable()
export class HelloMessagesService {
  private chats: MessagesConversation[] = [];

  public constructor(
    @InjectRepository(HelloMessage)
    private readonly hlRepository: Repository<HelloMessage>,
    @InjectRepository(Convo)
    private readonly convoRepository: Repository<Convo>,
    @Inject(VkApiService) private readonly api: VkApiService,
    @Inject(LoggerService) private readonly logger: LoggerService
  ) {}

  public async getChats(): Promise<IApi.IHelloMessagesApi.GetChatsResponse> {
    this.logger.log('HelloMessagesService: Vera chats were reqeusted');

    const convos = await this.convoRepository.find();
    const convoIds = convos.map((convo) => convo.id);
    console.log(convoIds);

    const chats = await this.api.getConversationsById(convoIds);
    console.log(chats);
    this.chats = filterByGroupChat(chats.items);

    return {
      count: this.chats.length,
      items: this.chats,
    };
  }
}
