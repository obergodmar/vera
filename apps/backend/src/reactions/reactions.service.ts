import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { IApi, IReactions } from '@vera-reforged/common';

import { Repository } from 'typeorm';
import { MessageContext } from 'vk-io';

import { IEnvironment } from '../environments/env-type';
import { LoggerService } from '../logger/logger.service';
import { VkApiService } from '../vk-api/vk-api.service';
import { CreateReactionForChat, UpdateReactionForChat } from './reactions.dto';
import { Reaction } from './reactions.entity';

@Injectable()
export class ReactionsService {
  public constructor(
    @InjectRepository(Reaction)
    private readonly reactionsRepository: Repository<Reaction>,
    @Inject(VkApiService) private readonly api: VkApiService,
    @Inject(LoggerService) private readonly logger: LoggerService,
    @Inject(ConfigService) private readonly config: ConfigService
  ) {
    const isListenerOff =
      this.config.get<IEnvironment['disableBotListener']>('disableBotListener');

    this.api.botService.bot.hear(/.*/, async (msg: MessageContext) => {
      if (isListenerOff) {
        return;
      }

      const { peerId, $match = [] } = msg;
      const [text] = $match;

      let reactions: IReactions.ChatReaction[] = [];
      try {
        reactions = await this.reactionsRepository.find({
          where: { chatId: peerId, enabled: true },
        });
      } catch (e) {
        this.logger.log(
          `ReactionsService: error getting reactions for chat ${peerId}: ${e}`,
          { type: 'error' }
        );
      }

      reactions.forEach((reactionItem) => {
        const { textTrigger, reaction } = reactionItem;
        const regexp = new RegExp(textTrigger);

        if (regexp.test(text)) {
          this.logger.log(
            `ReactionsService: Found match "${textTrigger}" for reaction "${reaction}"" in chat ${peerId}`
          );

          this.api.botService.vk.api.messages.send({
            peer_id: peerId,
            message: reaction,
            random_id: 0,
          });

          this.logger.log(
            `ReactionsService: Sent reaction "${reaction}" for chat ${peerId}`
          );
        }
      });
    });
  }

  public async getReactionsForChat(
    chatId: number
  ): Promise<IApi.IReactionsApi.GetReactionsForChatResponse> {
    this.logger.log(
      `ReactionsService: reactions were requested for chat ${chatId}`
    );

    try {
      const reactions = await this.reactionsRepository.find({
        where: { chatId },
      });

      return {
        count: reactions.length,
        items: reactions,
      };
    } catch (e) {
      this.logger.log(
        `ReactionsService: error getting reactions for chat ${chatId}: ${e}`,
        { type: 'error' }
      );

      return {
        count: 0,
        items: [],
      };
    }
  }

  public async createReactionForChat(
    reactionCreationDto: CreateReactionForChat
  ): Promise<IApi.IReactionsApi.CreateReactionForChatResponse> {
    const { chatId, reaction, textTrigger, enabled } = reactionCreationDto;

    this.logger.log(
      `ReactionsService: Creating reaction "${reaction}" with trigger ${textTrigger} for chat ${chatId}`
    );

    try {
      await this.reactionsRepository.insert({
        chatId,
        reaction,
        textTrigger,
        enabled,
      });
    } catch (e) {
      this.logger.log(
        `ReactionsService: Error when creating reaction ${reaction} for chat ${chatId}: ${e}`,
        { type: 'error' }
      );

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
    reactionUpdateDto: UpdateReactionForChat
  ): Promise<IApi.IReactionsApi.UpdateReactionForChatResponse> {
    const { id, chatId, reaction, textTrigger, enabled } = reactionUpdateDto;

    const isDeleting = !reaction || !textTrigger;

    this.logger.log(
      `ReactionsService: ${isDeleting ? 'Deleting' : 'Updating'} reaction ${
        reaction && ` ${reaction}`
      } for chat ${chatId}`
    );

    try {
      if (isDeleting) {
        await this.reactionsRepository.delete({ id });
      } else {
        await this.reactionsRepository.upsert(
          [{ id, chatId, reaction, textTrigger, enabled }],
          ['id']
        );
      }
    } catch (e) {
      this.logger.log(
        `ReactionsService: Error upserting new reaction into ${chatId}: ${e}`,
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
