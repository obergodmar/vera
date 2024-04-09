import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import {
  filterScheduleByChatAndTag,
  filterScheduleByDay,
  filterScheduleByDayAndTime,
  getAnnounceDutyMessage,
  getDayMonthTime,
  getRandomId,
  IApi,
  IDuty,
} from '@vera-reforged/common';
import { MessagesGetConversationMembersResponse } from '@vkontakte/api-schema-typescript';

import { DataSource, Repository } from 'typeorm';
import { UsersUserFull } from 'vk-io/lib/api/schemas/objects';

import { BotService } from '../bot/bot.service';
import { IEnvironment } from '../environments/env-type';
import { DebugService } from '../logger/debug.service';
import { LoggerService } from '../logger/logger.service';
import { VkApiService } from '../vk-api/vk-api.service';
import { Duty } from './duty.entity';

@Injectable()
export class DutyService {
  private readonly logger: DebugService;

  public constructor(
    private dataSource: DataSource,
    @InjectRepository(Duty) private readonly dutyRepository: Repository<Duty>,
    @Inject(BotService) private readonly botService: BotService,
    @Inject(VkApiService) private readonly vkApi: VkApiService,
    @Inject(ConfigService) private readonly config: ConfigService,
    @Inject(LoggerService) loggerService: LoggerService,
  ) {
    this.logger = new DebugService(loggerService, this.constructor.name);

    const isListenerOff =
      this.config.get<IEnvironment['disableBotListener']>('disableBotListener');

    this.botService.vk.updates.on('message_new', async (msg, next) => {
      if (isListenerOff) {
        return next();
      }

      const { peerId, text } = msg;

      const regexp = /duty(\s#?(?<tag>\w+))?/;

      if (!regexp.test(text)) {
        return next();
      }

      const { tag } = regexp.exec(text).groups || { tag: null };

      this.lookForDutyAndAnnounce.call(this, peerId, tag);

      return next();
    });
  }

  public async lookForDutyAndAnnounce(peerId: number, tag: string | null) {
    const chatAndTagSchedule = await this.filterScheduleForChatAndTag(
      peerId,
      tag,
    );

    const currentTimeDuties =
      this.filterScheduleForCurrentDayAndTime(chatAndTagSchedule);

    const { schedule, noDutyAtCurrentTime } =
      this.filterScheduleIfNoDutyAtCurrentTime.call(
        this,
        currentTimeDuties,
        chatAndTagSchedule,
      );

    this.announceDuty.call(this, peerId, schedule, tag, noDutyAtCurrentTime);
  }

  private async announceDuty(
    peerId: number,
    schedule: IDuty.Schedule[],
    tag: string | null,
    noDutyAtCurrentTime: boolean,
  ): Promise<void> {
    let message: string;
    try {
      message = getAnnounceDutyMessage(schedule, tag, noDutyAtCurrentTime);

      await this.vkApi.fetch(
        'messages.send',
        {
          peer_id: peerId,
          message,
          random_id: getRandomId(),
          group_id: 1,
        },
        { retries: 3 },
      );
    } catch (error: unknown) {
      this.logger.error(`announceDuty: ${error}`);
    }

    this.logger.debug(
      `Duty was requested in ${peerId}.\nMessage was sent: ${message}`,
    );
  }

  public async getMembersForChat(
    chatId: number,
  ): Promise<IApi.IDutyApi.GetMembersForChatResponse> {
    let response: MessagesGetConversationMembersResponse;
    try {
      response = await this.vkApi.fetch(
        'messages.getConversationMembers',
        {
          fields: '',
          // extended: 1,
          peer_id: chatId,
          group_id: 1,
        },
        {
          retries: 3,
        },
      );
    } catch (error: unknown) {
      this.logger.error(`getMembersForChat: ${error}`);

      return {
        items: [],
        count: 0,
        error: 'Что-то пошло не так',
      };
    }

    return response;
  }

  public async getScheduleForChat(
    chatId: number,
  ): Promise<IApi.IDutyApi.GetScheduleForChatResponse> {
    this.logger.debug(`Duty schedule for chat ${chatId} was requested`);

    let dutyArray: Duty[] = [];

    try {
      dutyArray = await this.dutyRepository.findBy({ chatId });
      this.logger.debug(`Found ${dutyArray.length} duties for chat ${chatId}`);
    } catch (e) {
      this.logger.error(
        `Duty repository error when selecting for chat ${chatId}: ${e}`,
      );

      return [];
    }

    if (!dutyArray.length) {
      return [];
    }

    this.logger.debug('Fetching users');

    const userIds = dutyArray.map((duty) => duty.userId);
    let users: UsersUserFull[] = [];

    try {
      users = await this.vkApi.fetch(
        'users.get',
        {
          user_ids: userIds.join(','),
        },
        { retries: 3 },
      );

      this.logger.debug('Fetch successfull');
    } catch (e) {
      this.logger.error(`Couldn't fetch users, ${e}`);

      return [];
    }

    return dutyArray.reduce(
      (acc, { chatId, userId, dayNumber, timeFrom, timeTo, tag }) => {
        const user = users.find(({ id }) => id === userId);
        if (!user) {
          return acc;
        }

        const {
          first_name: firstName,
          last_name: lastName,
          screen_name: screenName,
          photo_50: avatar,
        } = user;

        return [
          ...acc,
          {
            chatId,
            userId,
            firstName,
            lastName,
            avatar,
            screenName,
            dayNumber,
            timeFrom,
            timeTo,
            tag,
          },
        ];
      },
      [],
    );
  }

  public async updateChatSchedule(
    chatId: number,
    chatSchedule: IDuty.Schedule[],
  ) {
    let error: string;

    const dutiesToInsert: Omit<Duty, 'id'>[] = chatSchedule.map(
      ({ userId, chatId, dayNumber, timeFrom, timeTo, tag }) => ({
        userId,
        chatId,
        dayNumber,
        timeFrom,
        timeTo,
        tag,
      }),
    );
    this.logger.debug(`Starting transaction for chat ${chatId}`);

    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      await this.dutyRepository.delete({ chatId });
      await this.dutyRepository.insert(dutiesToInsert);

      await queryRunner.commitTransaction();
      this.logger.debug(`Changes were made in ${chatId}`);
    } catch (e) {
      error = JSON.stringify(e);

      await queryRunner.rollbackTransaction();
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

  private filterScheduleForCurrentDayAndTime(
    schedule: IDuty.Schedule[],
  ): IDuty.Schedule[] {
    const { dayNumber, hours, minutes } = getDayMonthTime();

    const currentTimeInMinutes = hours * 60 + minutes;

    return filterScheduleByDayAndTime(
      schedule,
      dayNumber,
      currentTimeInMinutes,
    );
  }

  private filterScheduleIfNoDutyAtCurrentTime(
    currentSchedule: IDuty.Schedule[],
    schedule: IDuty.Schedule[],
  ): {
    schedule: IDuty.Schedule[];
    noDutyAtCurrentTime: boolean;
  } {
    const { dayNumber, hours, minutes } = getDayMonthTime();

    const currentTimeInMinutes = hours * 60 + minutes;

    if (currentSchedule.length === 0) {
      return {
        schedule: filterScheduleByDay(
          schedule,
          dayNumber,
          currentTimeInMinutes,
        ),
        noDutyAtCurrentTime: true,
      };
    }

    return {
      schedule: currentSchedule,
      noDutyAtCurrentTime: false,
    };
  }

  private async filterScheduleForChatAndTag(
    chatId: number,
    tag: string | null,
  ): Promise<IDuty.Schedule[]> {
    const schedule = await this.getScheduleForChat(chatId);

    return filterScheduleByChatAndTag(schedule, chatId, tag);
  }
}
