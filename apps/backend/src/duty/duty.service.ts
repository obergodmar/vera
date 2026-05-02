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

import { BotEventBusService } from '../bot-core/bot-event-bus.service';
import { BOT_PLATFORM_TOKEN, IBotPlatform } from '../bot-platform/IBotPlatform';
import { IEnvironment } from '../environments/env-type';
import { DebugService } from '../logger/debug.service';
import { LoggerService } from '../logger/logger.service';
import { Duty } from './duty.entity';

@Injectable()
export class DutyService {
  private readonly logger: DebugService;

  public constructor(
    private dataSource: DataSource,
    @InjectRepository(Duty) private readonly dutyRepository: Repository<Duty>,
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

      const { peerId, text } = event;
      if (!text) {
        return;
      }

      const regexp = /duty(\s#?(?<tag>\w+))?/;
      if (!regexp.test(text)) {
        return;
      }

      const { tag } = regexp.exec(text).groups || { tag: null };

      this.lookForDutyAndAnnounce.call(this, peerId, tag);
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
      await this.bot.sendMessage(peerId, message);
    } catch (error: unknown) {
      this.logger.error(`announceDuty: ${error}`);
    }

    this.logger.debug(
      `Duty was requested in ${peerId}.\nMessage was sent: ${message}`,
    );
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
    const users = await this.bot.getUsers(userIds);

    if (!users.length) {
      this.logger.error('Fetch users returned empty result');
      return [];
    }

    const userMap = new Map(users.map((u) => [u.id, u]));

    return dutyArray.reduce(
      (acc, { chatId, userId, dayNumber, timeFrom, timeTo, tag }) => {
        const user = userMap.get(userId);
        if (!user) {
          return acc;
        }

        return [
          ...acc,
          {
            chatId,
            userId,
            firstName: user.firstName,
            lastName: user.lastName ?? '',
            photo: user.photo,
            username: user.username,
            mention: user.mention,
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

      await queryRunner.manager.delete(Duty, { chatId });
      await queryRunner.manager.insert(Duty, dutiesToInsert);

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
        error: 'Ошибка обновления',
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
