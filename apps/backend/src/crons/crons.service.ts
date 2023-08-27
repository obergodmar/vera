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

  public async createCronForChat(
    cronCreationDto: CreateCronForChatDto
  ): Promise<IApi.ICronsApi.CreateCronForChatResponse> {
    const { chatId, message, daysRange, timeAt, enabled } = cronCreationDto;

    this.logger.log(
      `CronsService: Creating cron "${message}" repeating ${daysRange} at ${timeAt} for ${chatId}`
    );
  }

  public async updateCronForChat(
    cronUpdateDto: UpdateCronForChatDto
  ): Promise<IApi.ICronsApi.UpdateCronForChatResponse> {}
}
