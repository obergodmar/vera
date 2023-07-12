import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IApi, IHelloMessages } from '@vera-reforged/common';

import { DataSource, Repository } from 'typeorm';
import { MessageContext } from 'vk-io';

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
  ) {
    this.api.botService.vk.updates.on(
      'chat_invite_user',
      async (context: MessageContext) => {
        const { peerId } = context;

        this.logger.log(
          `HelloMessagesService: chat_invite_user update in ${peerId}`
        );

        try {
          const helloMessage = await this.hlRepository.findOneBy({
            chatId: peerId,
          });
          if (!helloMessage) {
            return;
          }

          this.api.botService.vk.api.messages.send({
            peer_id: peerId,
            message: helloMessage.message,
            random_id: 0,
          });

          this.logger.log(
            `HelloMessagesService: Successfully answered to ${peerId} with ${helloMessage.message}`
          );
        } catch (e) {
          this.logger.log(
            `HelloMessagesService: Error when answering on update in ${peerId}: ${e}`,
            { type: 'error' }
          );
        }
      }
    );
  }

  public async getHelloMessages(): Promise<IApi.IHelloMessagesApi.GetHelloMessagesResponse> {
    this.logger.log('HelloMessagesService : hello messages were requested');

    try {
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
    } catch (e) {
      this.logger.log(
        `HelloMessagesService: error getting helloMessages: ${e}`,
        { type: 'error' }
      );

      return {
        count: 0,
        items: [],
      };
    }
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
