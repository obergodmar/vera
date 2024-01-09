import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { IApi, IReactions } from '@vera-reforged/common';

import { Repository } from 'typeorm';

import { IEnvironment } from '../environments/env-type';
import { DebugService } from '../logger/debug.service';
import { LoggerService } from '../logger/logger.service';
import { VkApiService } from '../vk-api/vk-api.service';
import {
  CreateReactionForChatDto,
  UpdateReactionForChatDto,
} from './reactions.dto';
import { Reaction } from './reactions.entity';

@Injectable()
export class ReactionsService {
  private readonly logger: DebugService;

  public constructor(
    @InjectRepository(Reaction)
    private readonly reactionsRepository: Repository<Reaction>,
    @Inject(VkApiService) private readonly api: VkApiService,
    @Inject(ConfigService) private readonly config: ConfigService,
    @Inject(LoggerService) loggerService: LoggerService,
  ) {
    this.logger = new DebugService(loggerService, this.constructor.name);

    const isListenerOff =
      this.config.get<IEnvironment['disableBotListener']>('disableBotListener');

    this.api.botService.vk.updates.on('message_new', async (msg, next) => {
      if (isListenerOff) {
        return next();
      }

      const { peerId, conversationMessageId, text } = msg;
      let reactions: IReactions.ChatReaction[] = [];
      try {
        reactions = await this.reactionsRepository.find({
          where: { chatId: peerId, enabled: true },
        });
      } catch (e) {
        this.logger.error(`Failed to get reactions for chat ${peerId}: ${e}`);
      }

      reactions.forEach((reactionItem) => {
        const { textTrigger, reaction } = reactionItem;
        const regexp = new RegExp(textTrigger);

        if (regexp.test(text)) {
          this.logger.debug(
            `Found match "${textTrigger}" for reaction "${reaction}"" in chat ${peerId}`,
          );

          this.api.botService.vk.api.messages.send({
            peer_id: peerId,
            message: reaction,
            random_id: 0,
            forward: JSON.stringify({
              peer_id: peerId,
              is_reply: true,
              conversation_message_ids: conversationMessageId,
            }),
          });

          this.logger.debug(`Sent reaction "${reaction}" for chat ${peerId}`);
        }
      });

      return next();
    });
  }

  public async getReactionsForChat(
    chatId: number,
  ): Promise<IApi.IReactionsApi.GetReactionsForChatResponse> {
    this.logger.debug(`Reactions were requested for chat ${chatId}`);

    try {
      const reactions = await this.reactionsRepository.find({
        where: { chatId },
      });

      return {
        count: reactions.length,
        items: reactions,
      };
    } catch (e) {
      this.logger.error(`Failed to get reactions for chat ${chatId}: ${e}`);

      return {
        count: 0,
        items: [],
      };
    }
  }

  public async createReactionForChat(
    reactionCreationDto: CreateReactionForChatDto,
  ): Promise<IApi.IReactionsApi.CreateReactionForChatResponse> {
    const { chatId, reaction, textTrigger, enabled } = reactionCreationDto;

    const logMeta = `"${reaction}" with trigger ${textTrigger} for chat ${chatId}`;
    this.logger.debug(`Creating reaction ${logMeta}`);

    try {
      await this.reactionsRepository.insert({
        chatId,
        reaction,
        textTrigger,
        enabled,
      });
    } catch (e) {
      this.logger.error(`Can't create reaction ${logMeta}: ${e}`);

      return {
        success: false,
        error: JSON.stringify(e),
      };
    }

    return {
      success: true,
    };
  }

  public async updateReactionForChat(
    reactionUpdateDto: UpdateReactionForChatDto,
  ): Promise<IApi.IReactionsApi.UpdateReactionForChatResponse> {
    const { id, chatId, reaction, textTrigger, enabled } = reactionUpdateDto;

    const isDeleting = !reaction || !textTrigger;

    const logMeta = `"[${id}]: ${reaction}" with trigger ${textTrigger} for chat ${chatId}`;
    this.logger.debug(
      `${isDeleting ? 'Deleting' : 'Updating'} reaction ${
        !isDeleting ? `${logMeta}` : `${id} for chat ${chatId}`
      }`,
    );

    try {
      if (isDeleting) {
        await this.reactionsRepository.delete({ id });
      } else {
        await this.reactionsRepository.upsert(
          [{ id, chatId, reaction, textTrigger, enabled }],
          ['id'],
        );
      }
    } catch (e) {
      this.logger.error(`Can't update reaction ${id} in ${chatId}: ${e}`);
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
