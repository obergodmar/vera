import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { IApi, IReactions } from '@vera-reforged/common';

import { Repository } from 'typeorm';

import { BotEventBusService } from '../bot-core/bot-event-bus.service';
import { BOT_PLATFORM_TOKEN, IBotPlatform } from '../bot-platform/IBotPlatform';
import { DutyService } from '../duty/duty.service';
import { IEnvironment } from '../environments/env-type';
import { DebugService } from '../logger/debug.service';
import { LoggerService } from '../logger/logger.service';
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
    @Inject(DutyService) private readonly dutyService: DutyService,
    @Inject(BotEventBusService)
    private readonly botEventBus: BotEventBusService,
    @Inject(BOT_PLATFORM_TOKEN) private readonly bot: IBotPlatform,
    @Inject(ConfigService) private readonly config: ConfigService,
    @Inject(LoggerService) loggerService: LoggerService,
  ) {
    this.logger = new DebugService(loggerService, this.constructor.name);

    const isListenerOff =
      this.config.get<IEnvironment['disableBotListener']>('disableBotListener');

    this.botEventBus.onMessage(async (event) => {
      if (isListenerOff) {
        return;
      }

      const { peerId, conversationMessageId, text } = event;
      if (!text) {
        return;
      }

      let reactions: IReactions.ChatReaction[] = [];
      try {
        reactions = await this.reactionsRepository.find({
          where: { chatId: peerId, enabled: true },
        });
      } catch (e) {
        this.logger.error(`Failed to get reactions for chat ${peerId}: ${e}`);
      }

      for (const reactionItem of reactions) {
        const { textTrigger, reaction, callDuty, dutyTag } = reactionItem;

        let regexp: RegExp;
        try {
          const [plain, trigger, flags] = textTrigger.split('/');

          regexp = plain ? new RegExp(plain) : new RegExp(trigger, flags);
        } catch (e: unknown) {
          this.logger.error(`Error parsing textTrigger ${textTrigger}: ${e}`);

          continue;
        }

        if (regexp.test(text)) {
          this.logger.debug(
            `Found match "${textTrigger}" for reaction "${reaction}" in chat ${peerId}`,
          );

          try {
            await this.bot.sendMessage(peerId, reaction, {
              replyToMessageId: conversationMessageId,
            });
          } catch (error: unknown) {
            this.logger.error(`Reactions messages send: ${error}`);
          }

          if (callDuty) {
            this.dutyService.lookForDutyAndAnnounce(peerId, dutyTag || null);
          }

          this.logger.debug(`Sent reaction "${reaction}" for chat ${peerId}`);
        }
      }
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
    const { chatId, reaction, textTrigger, callDuty, dutyTag, enabled } =
      reactionCreationDto;

    const logMeta = getReactionLogMeta(reactionCreationDto);
    this.logger.debug(`Creating reaction ${logMeta}`);

    try {
      await this.reactionsRepository.insert({
        chatId,
        reaction,
        textTrigger,
        callDuty,
        dutyTag,
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
    const { id, chatId, reaction, textTrigger, callDuty, dutyTag, enabled } =
      reactionUpdateDto;

    const isDeleting = !reaction || !textTrigger;

    const logMeta = getReactionLogMeta(reactionUpdateDto);
    this.logger.debug(
      `${isDeleting ? 'Deleting' : 'Updating'} reaction ${logMeta}`,
    );

    try {
      if (isDeleting) {
        await this.reactionsRepository.delete({ id });
      } else {
        await this.reactionsRepository.upsert(
          [{ id, chatId, reaction, textTrigger, callDuty, dutyTag, enabled }],
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

function getReactionLogMeta(
  reactionItem: Omit<IReactions.ChatReaction, 'id'> & { id?: number },
): string {
  const { id, chatId, reaction, textTrigger, callDuty, dutyTag } = reactionItem;
  const common = `"${reaction}" with trigger ${textTrigger} for chat ${chatId} with callDuty: ${
    callDuty ? `enabled (#${dutyTag})` : 'disabled'
  }`;

  return id ? `[${id}]: ${common}` : common;
}
