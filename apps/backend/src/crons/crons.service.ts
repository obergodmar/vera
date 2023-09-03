import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { IApi } from '@vera-reforged/common';

import { Repository } from 'typeorm';

import { LoggerService } from '../logger/logger.service';
import { VkApiService } from '../vk-api/vk-api.service';
import { CreateCronForChatDto, UpdateCronForChatDto } from './crons.dto';
import { Cron } from './crons.entity';

@Injectable()
export class CronsService {
  public constructor(
    @InjectRepository(Cron)
    private readonly cronsRepository: Repository<Cron>,
    @Inject(VkApiService) private readonly api: VkApiService,
    @Inject(LoggerService) private readonly logger: LoggerService,
    @Inject(ConfigService) private readonly config: ConfigService
  ) {}

  public async getCronsForChat(
    chatId: number
  ): Promise<IApi.ICronsApi.GetCronsForChatResponse> {
    this.logger.log(`CronsService: crons were requested for chat ${chatId}`);

    try {
      const crons = await this.cronsRepository.find({
        where: { chatId },
      });

      return {
        count: crons.length,
        items: crons,
      };
    } catch (e) {
      this.logger.log(
        `CronsService: error getting crons for chat ${chatId}: ${e}`,
        { type: 'error' }
      );

      return {
        count: 0,
        items: [],
      };
    }
  }

  public async getCronsChatsResponse(): Promise<IApi.ICronsApi.GetCronsChatsResponse> {
    this.logger.log('CronsService: crons chats were requested');

    try {
      const cronsChats = await this.cronsRepository.find();

      this.logger.log('CronsService: crons chats were sucessfully sent');

      return {
        count: cronsChats.length,
        items: cronsChats.map(({ chatId }) => chatId),
      };
    } catch (e) {
      this.logger.log(`CronsService: error getting cron chats: ${e}`, {
        type: 'error',
      });

      return {
        count: 0,
        items: [],
      };
    }
  }

  public async createCronForChat(
    cronCreationDto: CreateCronForChatDto
  ): Promise<IApi.ICronsApi.CreateCronForChatResponse> {
    const { chatId, message, daysRange, timeAt, enabled } = cronCreationDto;

    const logMeta = `"${message}" repeating ${daysRange} at ${timeAt} for ${chatId}`;
    this.logger.log(`CronsService: Creating cron ${logMeta}`);

    try {
      await this.cronsRepository.insert({
        chatId,
        timeAt,
        enabled,
        message,
        daysRange,
      });
    } catch (e) {
      this.logger.log(
        `CronsService: Error when creating cron ${logMeta}: ${e}`,
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

  public async updateCronForChat(
    cronUpdateDto: UpdateCronForChatDto
  ): Promise<IApi.ICronsApi.UpdateCronForChatResponse> {
    const { id, chatId, message, daysRange, timeAt, enabled } = cronUpdateDto;

    const isDeleting = !message || !daysRange || !timeAt;

    const logMeta = `[${id}]: "${message}" repeating ${daysRange} at ${timeAt} for ${chatId}`;
    this.logger.log(
      `CronsService: ${isDeleting ? 'Deleting' : 'Updating'} cron ${
        !isDeleting ? `${logMeta}` : `${id} for ${chatId}`
      }`
    );

    try {
      if (isDeleting) {
        await this.cronsRepository.delete({ id });
      } else {
        await this.cronsRepository.upsert(
          [{ id, chatId, daysRange, timeAt, message, enabled }],
          ['id']
        );
      }
    } catch (e) {
      this.logger.log(
        `CronsService: Error updating cron ${id} in ${chatId}: ${e}`,
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

  public async disableCronsForChat(
    chatId: number
  ): Promise<IApi.ICronsApi.DisableCronsForChatResponse> {
    this.logger.log(
      `CronsService: Start disabling all crons for chat: ${chatId}`
    );

    try {
      const res = await this.cronsRepository.update(
        { chatId },
        { enabled: false }
      );

      this.logger.log(
        `CronsService: Successfully disabled all crons for chat: ${chatId}`
      );

      return {
        success: true,
        count: res.affected,
      };
    } catch (e) {
      this.logger.log(
        `CronsService: Error when disabling crons for chat: ${chatId}: ${e}`,
        { type: 'error' }
      );

      return {
        error: JSON.stringify(e),
      };
    }
  }

  public async disableAllCrons(): Promise<IApi.ICronsApi.DisableAllCronsResponse> {
    this.logger.log('CronsService: Start disabling all crons');

    try {
      const res = await this.cronsRepository.update({}, { enabled: false });

      this.logger.log('CronsService: Successfully disabled all crons ');

      return {
        success: true,
        count: res.affected,
      };
    } catch (e) {
      this.logger.log(`CronsService: Error when disabling all crons: ${e}`, {
        type: 'error',
      });

      return {
        error: JSON.stringify(e),
      };
    }
  }
}
