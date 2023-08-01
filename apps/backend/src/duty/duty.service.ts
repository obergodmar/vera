import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import {
  filterScheduleByChatAndTag,
  filterScheduleByDay,
  filterScheduleByDayAndTime,
  getAnnounceDutyMessage,
  getDayMonthTime,
  IApi,
  IDuty,
} from '@vera-reforged/common';

import { DataSource, Repository } from 'typeorm';
import { MessageContext } from 'vk-io';
import { UsersUserFull } from 'vk-io/lib/api/schemas/objects';

import { IEnvironment } from '../environments/env-type';
import { LoggerService } from '../logger/logger.service';
import { VkApiService } from '../vk-api/vk-api.service';
import { Duty } from './duty.entity';

@Injectable()
export class DutyService {
  public constructor(
    private dataSource: DataSource,
    @InjectRepository(Duty) private readonly dutyRepository: Repository<Duty>,
    @Inject(VkApiService) private readonly api: VkApiService,
    @Inject(LoggerService) private readonly logger: LoggerService,
    @Inject(ConfigService) private readonly config: ConfigService
  ) {
    const isListenerOff =
      this.config.get<IEnvironment['disableBotListener']>('disableBotListener');

    this.api.botService.bot.hear(
      /duty(\s#?\w+)?/,
      async (msg: MessageContext) => {
        if (isListenerOff) {
          return;
        }

        const { peerId, $match } = msg;
        const [, hashtag] = $match || [];

        const tag = hashtag?.replace(/\s?#?/, '') || null;

        const chatAndTagSchedule = await this.filterScheduleForChatAndTag.call(
          this,
          peerId,
          tag
        );

        const currentTimeDuties = this.filterScheduleForCurrentDayAndTime.call(
          this,
          chatAndTagSchedule
        );

        const { schedule, noDutyAtCurrentTime } =
          this.filterScheduleIfNoDutyAtCurrentTime.call(
            this,
            currentTimeDuties,
            chatAndTagSchedule
          );

        this.announceDuty.call(
          this,
          peerId,
          schedule,
          tag,
          noDutyAtCurrentTime
        );
      }
    );
  }

  private announceDuty(
    peerId: number,
    schedule: IDuty.Schedule[],
    tag: string | null,
    noDutyAtCurrentTime: boolean
  ) {
    const message = getAnnounceDutyMessage(schedule, tag, noDutyAtCurrentTime);

    this.api.botService.vk.api.messages.send({
      peer_id: peerId,
      message,
      random_id: 0,
    });

    this.logger.log(
      `DutyService: A duty was requested in ${peerId}.\nMessage was sent: ${message}`
    );
  }

  public async getMembersForChat(chatId: number) {
    return this.api.getConversationMembers(chatId);
  }

  public async getScheduleForChat(
    chatId: number
  ): Promise<IApi.IDutyApi.GetScheduleForChatResponse> {
    this.logger.log(
      `DutyService: Duty schedule for chat ${chatId} was requested`
    );

    let dutyArray: Duty[] = [];

    try {
      dutyArray = await this.dutyRepository.findBy({ chatId });
      this.logger.log(
        `DutyService: Found ${dutyArray.length} duties for chat ${chatId}`
      );
    } catch (e) {
      this.logger.log(
        `DutyService: dutyRepository error when selecting for chat ${chatId}: ${e}`,
        { type: 'error' }
      );

      return [];
    }

    if (!dutyArray.length) {
      return [];
    }

    this.logger.log(`DutyService: Fetching users`);

    const userIds = dutyArray.map((duty) => duty.userId);
    let users: UsersUserFull[] = [];

    try {
      users = await this.api.getUsers(userIds);
      this.logger.log(`DutyService: Fetch successfull`);
    } catch (e) {
      this.logger.log(`DutyService: Error when fetching users, ${e}`, {
        type: 'error',
      });

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
      []
    );
  }

  public async updateChatSchedule(
    chatId: number,
    chatSchedule: IDuty.Schedule[]
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
      })
    );
    this.logger.log(`DutyService: Starting transaction for chat ${chatId}`);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      await this.dutyRepository.delete({ chatId });

      await this.dutyRepository.insert(dutiesToInsert);

      this.logger.log(`DutyService: Changes were made in ${chatId}`);
    } catch (e) {
      await queryRunner.rollbackTransaction();

      error = JSON.stringify(e);

      this.logger.log(`DutyService: Transaction failed: ${e}`, {
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

  private filterScheduleForCurrentDayAndTime(
    schedule: IDuty.Schedule[]
  ): IDuty.Schedule[] {
    const { dayNumber, hours, minutes } = getDayMonthTime();

    const currentTimeInMinutes = hours * 60 + minutes;

    return filterScheduleByDayAndTime(
      schedule,
      dayNumber,
      currentTimeInMinutes
    );
  }

  private filterScheduleIfNoDutyAtCurrentTime(
    currentSchedule: IDuty.Schedule[],
    schedule: IDuty.Schedule[]
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
          currentTimeInMinutes
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
    tag: string | null
  ): Promise<IDuty.Schedule[]> {
    const schedule = await this.getScheduleForChat(chatId);

    return filterScheduleByChatAndTag(schedule, chatId, tag);
  }
}
