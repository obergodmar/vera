import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IApi, IHelloMessages } from '@vera-reforged/common';

import { DataSource, Repository } from 'typeorm';

import { ConvoService } from '../convo/convo.service';
import { LoggerService } from '../logger/logger.service';
import { VkApiService } from '../vk-api/vk-api.service';
import { HelloMessage } from './hello-messages.entity';

@Injectable()
export class HelloMessagesService {
  public constructor(
    private readonly dataSource: DataSource,
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
      `HelloMessagesService: ${message ? 'Setting' : 'Deleting'} message${
        message && ` ${message}`
      } for chat ${chatId}`
    );

    try {
      if (!message) {
        await this.hlRepository.delete({ chatId });
      } else {
        await this.hlRepository.upsert([{ chatId, message }], ['chatId']);
      }
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

  public async updateAllHelloMessages(
    data: IHelloMessages.MessagePerChat[]
  ): Promise<IApi.StatusResponse> {
    this.logger.log(
      'HelloMessagesService: Starting transaction for all messages in db'
    );
    let error: string;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      const upserts = data.filter(({ message }) => !!message);
      await this.hlRepository.upsert(upserts, ['chatId']);

      const deletions = data
        .filter(({ message }) => !message)
        .map(({ chatId }) => this.hlRepository.delete({ chatId }));
      await Promise.all(deletions);

      this.logger.log(
        'HelloMessagesService: Transaction successfull - changes were made'
      );
    } catch (e) {
      await queryRunner.rollbackTransaction();

      error = JSON.stringify(e);

      this.logger.log(`HelloMessagesService: Transaction failed: ${e}`, {
        type: 'error',
      });
    } finally {
      await queryRunner.release();
    }

    if (error) {
      return {
        error,
        success: false,
      };
    }

    return {
      success: true,
    };
  }
}
