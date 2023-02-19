import { Inject, Injectable } from '@nestjs/common';
import { Draft } from '@reduxjs/toolkit';
import {
  filterScheduleByChatAndTag,
  filterScheduleByDayAndTime,
  getDayMonthTime,
  getDutyMessage,
  getTimeInMinutes,
  IDuty,
} from '@vera-reforged/common';

import produce from 'immer';
import { pipe } from 'ramda';
import { MessageContext } from 'vk-io';

import { ConfigService } from '../config/config.service';
import { LoggerService } from '../logger/logger.service';
import { VkApiService } from '../vk-api/vk-api.service';

@Injectable()
export class DutyService {
  public constructor(
    @Inject(VkApiService) private readonly api: VkApiService,
    @Inject(ConfigService) private readonly config: ConfigService,
    @Inject(LoggerService) private readonly logger: LoggerService
  ) {
    this.api.botService.bot.hear(/duty(\s#?\w+)?/, (msg: MessageContext) => {
      const { peerType, peerId, $match } = msg;
      const [, hashtag] = $match || [];

      const tag = hashtag?.replace(/\s?#?/, '') || null;

      this.addChatIfDoesntExist.call(this, peerId, peerType);

      const schedule = pipe<
        [peerId: number, tag: string | null],
        IDuty.Schedule[],
        IDuty.Schedule[]
      >(
        this.filterScheduleForChatAndTag.bind(this),
        this.filterScheduleForCurrentDayAndTime.bind(this)
      )(peerId, tag);

      this.announceDuty.call(this, peerId, schedule, tag);
    });
  }

  private announceDuty(
    peerId: number,
    schedule: IDuty.Schedule[],
    tag: string | null
  ) {
    const sortedSchedule = produce(schedule, (draft) => {
      draft.sort((a, b) => {
        const timeA = getTimeInMinutes(a.timeFrom);
        const timeB = getTimeInMinutes(b.timeFrom);

        return timeA - timeB;
      });
    });

    let message;

    if (sortedSchedule.length === 0) {
      const withTag = tag ? `#${tag} ` : '';
      message = `${withTag}Нет дежурства в данное время`;
    } else {
      message = getDutyMessage(sortedSchedule);
    }

    this.api.botService.vk.api.messages.send({
      peer_id: peerId,
      message,
      random_id: 0,
    });

    this.logger.log(
      `DutyService: запросили duty в ${peerId}.\nОтправленное сообщение: ${message}`
    );
  }

  public async getChats() {
    const { chats } = this.getConfig();

    this.logger.log('DutyService: Были запрошены чаты Веры');

    if (!chats.length) {
      return { items: [] };
    }

    return this.api.getConversationsById(chats);
  }

  public async getMembersForChat(chatId: number) {
    return this.api.getConversationMembers(chatId);
  }

  public getDays() {
    const { days } = this.getConfig();

    this.logger.log('DutyService: Были получены настройки дней дежурства');

    return days;
  }

  public getSchedule() {
    const { schedule } = this.getConfig();

    return schedule;
  }

  public getScheduleForChat(chatId: number) {
    const { schedule } = this.getConfig();

    this.logger.log(
      `DutyService: Было получено расписание дежурства для чата ${chatId}`
    );

    return schedule.filter((duties) => duties.chatId === chatId);
  }

  public updateChatSchedule(chatId: number, chatSchedule: IDuty.Schedule[]) {
    const status = this.updateConfig((duty) => {
      const othersSchedule = duty.schedule.filter(
        (duty) => duty.chatId !== chatId
      );

      duty.schedule = [...othersSchedule, ...chatSchedule];
    });

    if (typeof status === 'string') {
      this.logger.log(`DutyService: В ${chatId} произошла ошибка: ${status}`);

      return {
        error: status,
      };
    }

    this.logger.log(`DutyService: В ${chatId} произведено изменение дежурства`);

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

  private filterScheduleForChatAndTag(chatId: number, tag: string | null) {
    const { schedule }: IDuty.IDuty = this.getConfig();

    return filterScheduleByChatAndTag(schedule, chatId, tag);
  }

  private addChatIfDoesntExist(chatId: number, peerType: string) {
    const { chats } = this.getConfig();

    if (peerType === 'chat') {
      this.logger.log(`DutyService: В чате ${chatId} запросили duty`);

      if (!chats.includes(chatId)) {
        this.api.botService.vk.api.messages.send({
          peer_id: chatId,
          message:
            'Возможность установки дежурства включена. Настройка доступна на https://vera.example.com',
          random_id: 0,
        });
      }

      this.updateConfig((duty) => {
        if (!duty.chats.includes(chatId)) {
          duty.chats.push(chatId);
        }
      });

      return;
    }

    this.logger.log(
      `DutyService: Пир ${chatId} запросил duty в персональном чате`
    );
  }

  private getConfig() {
    const { duty } = this.config.getConfig();

    return duty;
  }

  private updateConfig(recipe: (duty: Draft<IDuty.IDuty>) => void) {
    return this.config.updateConfig((config) => {
      config.duty = produce(config.duty, recipe);
    });
  }
}
