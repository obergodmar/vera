import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { IApi, IReactions } from '@vera-reforged/common';

import { DataSource, Repository } from 'typeorm';

import { ConvoService } from '../convo/convo.service';
import { IEnvironment } from '../environments/env-type';
import { LoggerService } from '../logger/logger.service';
import { VkApiService } from '../vk-api/vk-api.service';
import { CreateReactionForChat, UpdateReactionForChat } from './reactions.dto';
import { Reaction } from './reactions.entity';

@Injectable()
export class ReactionsService {
  public constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Reaction)
    private readonly reactionsRepository: Repository<Reaction>,
    @Inject(VkApiService) private readonly api: VkApiService,
    @Inject(LoggerService) private readonly logger: LoggerService,
    @Inject(ConvoService) private readonly convoService: ConvoService,
    @Inject(ConfigService) private readonly config: ConfigService
  ) {
    const isListenerOff =
      this.config.get<IEnvironment['disableBotListener']>('disableBotListener');
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
