import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { getRandomId, IApi, IHelloMessages } from '@vera-reforged/common';

import { Request } from 'express';
import { DataSource, Repository } from 'typeorm';

import { BotService } from '../bot/bot.service';
import { ConvoService } from '../convo/convo.service';
import { IEnvironment } from '../environments/env-type';
import { DebugService } from '../logger/debug.service';
import { LoggerService } from '../logger/logger.service';
import { VkApiService } from '../vk-api/vk-api.service';
import { HelloMessage } from './hello-messages.entity';

const SPAM_TIMEOUT = 1000;

@Injectable()
export class HelloMessagesService {
  private lock: NodeJS.Timeout | null = null;
  private readonly logger: DebugService;

  public constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(HelloMessage)
    private readonly hlRepository: Repository<HelloMessage>,
    @Inject(BotService) private readonly botService: BotService,
    @Inject(VkApiService) private readonly vkApi: VkApiService,
    @Inject(LoggerService) loggerService: LoggerService,
    @Inject(ConvoService) private readonly convoService: ConvoService,
    @Inject(ConfigService) private readonly config: ConfigService,
  ) {
    this.logger = new DebugService(loggerService, this.constructor.name);

    const isListenerOff =
      this.config.get<IEnvironment['disableBotListener']>('disableBotListener');

    this.botService.vk.updates.on('chat_invite_user', async (context, next) => {
      if (isListenerOff) {
        return next();
      }

      const { peerId } = context;

      this.logger.debug(`chat_invite_user update in ${peerId}`);

      try {
        const helloMessage = await this.hlRepository.findOneBy({
          chatId: peerId,
        });
        if (!helloMessage || this.lock) {
          return;
        }

        this.lock = setTimeout(() => {
          this.lock = null;
        }, SPAM_TIMEOUT);

        try {
          await this.vkApi.fetch(
            'messages.send',
            {
              peer_id: peerId,
              message: helloMessage.message,
              random_id: getRandomId(),
              group_id: 1,
            },
            { retries: 3 },
          );
        } catch (error: unknown) {
          this.logger.error(`Could not send message: ${error}`);
        }

        this.logger.debug(
          `Successfully answered to ${peerId} with ${helloMessage.message}`,
        );
      } catch (e) {
        this.logger.error(`Couldn't answer for update in ${peerId}: ${e}`);
      }
    });
  }

  public async getHelloMessages(
    req: Request,
  ): Promise<IApi.IHelloMessagesApi.GetHelloMessagesResponse> {
    this.logger.debug('Hello messages were requested');

    try {
      const messages = await this.hlRepository.find();
      const convos = await this.convoService.getChats(req);

      const convosWithMessages = messages.reduce(
        (
          chats: IApi.IHelloMessagesApi.ConvoListWithMessages[],
          { chatId, message },
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
        [],
      );

      return {
        count: convosWithMessages.length,
        items: convosWithMessages,
      };
    } catch (e) {
      this.logger.error(`Couldn't get helloMessages: ${e}`);

      return {
        count: 0,
        items: [],
      };
    }
  }

  public async updateHelloMessage(
    chatId: number,
    message: string,
  ): Promise<IApi.StatusResponse> {
    this.logger.debug(
      `${message ? 'Setting' : 'Deleting'} message${
        message && ` ${message}`
      } for chat ${chatId}`,
    );

    try {
      if (!message) {
        await this.hlRepository.delete({ chatId });
      } else {
        await this.hlRepository.upsert([{ chatId, message }], ['chatId']);
      }
    } catch (e) {
      this.logger.error(`Couldn't upsert new message into ${chatId}: ${e}`);
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
    data: IHelloMessages.MessagePerChat[],
  ): Promise<IApi.StatusResponse> {
    this.logger.debug('Starting transaction for all messages in db');
    let error: string;

    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const upserts = data.filter(({ message }) => !!message);
      await queryRunner.manager.upsert(HelloMessage, upserts, ['chatId']);

      const deletions = data
        .filter(({ message }) => !message)
        .map(({ chatId }) =>
          queryRunner.manager.delete(HelloMessage, { chatId }),
        );
      await Promise.all(deletions);

      await queryRunner.commitTransaction();

      this.logger.debug('Transaction successfull - changes were made');
    } catch (e) {
      await queryRunner.rollbackTransaction();

      error = JSON.stringify(e);

      this.logger.error(`Transaction failed: ${e}`);
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
