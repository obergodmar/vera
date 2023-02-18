import { Inject, Injectable } from '@nestjs/common';
import { Draft } from '@reduxjs/toolkit';
import {
  filterScheduleByChatAndTag,
  filterScheduleByDayAndTime,
  getTimeInMinutes,
  IDuty,
  isTimeToNextDay,
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
    this.api.botService.bot.hear(
      /duty(\s#[a-zA-Z0-9]+)?/,
      (msg: MessageContext) => {
        const { peerType, peerId, $match } = msg;
        const [, tag] = $match || [];

        this.addChatIfDoesntExist.call(this, peerId, peerType);

        const schedule = pipe(
          this.filterScheduleForChatAndTag.bind(this),
          this.filterScheduleForCurrentDayAndTime.call(this)
        )(peerId, tag);

        // const currentDuty = getDuty(msg.peerId);
        //
        // let message = 'duty отсутствует';
        //
        // if (currentDuty) {
        //   const { username, label, time, dayNumber } = currentDuty;
        //
        //   const [firstName] = label.split(' ');
        //   const date = new Date();
        //
        //   const month = date.getMonth() + 1;
        //   const day = date.getDate();
        //   const weekDay = date.getDay();
        //
        //   const tomorrow = new Date(date);
        //   tomorrow.setDate(day + 1);
        //
        //   const tomorrowMonth = tomorrow.getMonth() + 1;
        //   const tomorrowDay = tomorrow.getDate();
        //
        //   const yesterday = new Date(date);
        //   yesterday.setDate(day - 1);
        //
        //   const yesterdayMonth = yesterday.getMonth() + 1;
        //   const yesterdayDay = yesterday.getDate();
        //   const yesterdayWeekDay = yesterday.getDay();
        //
        //   const fromYesterdayToToday = dayNumber === yesterdayWeekDay;
        //   const fromTodayToYesterday = dayNumber === weekDay;
        //
        //   let dayFrom = '';
        //   let monthFrom = '';
        //
        //   let dayTo = '';
        //   let monthTo = '';
        //
        //   if (fromYesterdayToToday) {
        //     dayFrom = addLeadingZero(yesterdayDay);
        //     monthFrom = addLeadingZero(yesterdayMonth);
        //
        //     dayTo = addLeadingZero(day);
        //     monthTo = addLeadingZero(month);
        //   } else if (fromTodayToYesterday) {
        //     dayFrom = addLeadingZero(day);
        //     monthFrom = addLeadingZero(month);
        //
        //     dayTo = addLeadingZero(tomorrowDay);
        //     monthTo = addLeadingZero(tomorrowMonth);
        //   }
        //
        //   message = `@${username} (${firstName}) c ${
        //     time || '00:00'
        //   } ${dayFrom}.${monthFrom} до ${time || '00:00'} ${dayTo}.${monthTo}.`;
        // }
        //
        // this.botService.vk.api.messages.send({
        //   peer_id: msg.peerId,
        //   message,
        //   random_id: 0,
        // });
        //
        // this.botService.vk.api.messages.send({
        //   peer_id: 900033,
        //   message: `Айди беседы, где запросили duty ${msg.peerId}`,
        //   random_id: 0,
        // });
      }
    );
  }

  public async getChats() {
    const { chats } = this.getConfig();

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

    return days;
  }

  public getSchedule() {
    const { schedule } = this.getConfig();

    return schedule;
  }

  public getScheduleForChat(chatId: number) {
    const { schedule } = this.getConfig();

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
      return {
        error: status,
      };
    }

    return {
      success: true,
    };
  }

  private filterScheduleForCurrentDayAndTime(
    schedule: IDuty.Schedule[]
  ): IDuty.Schedule[] {
    const { dayNumber, hours, minutes } = getDayAndTime();

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
    if (peerType === 'chat') {
      this.logger.log(`DutyService: В чате ${chatId} запросили duty`);

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

function getDayAndTime() {
  const date = new Date();

  const dayNumber = date.getDay();

  const hours = date.getHours();
  const minutes = date.getMinutes();

  return {
    dayNumber,
    hours,
    minutes,
  };
}

// function getDuty(peerId: number) {
//   const date = new Date();
//   const day = date.getDay();
//   const hours = date.getHours();
//   const minutes = date.getMinutes();
//
//   const config = getConfig();
//   const {
//     duty: { chats },
//   } = config;
//
//   if (!chats.includes(peerId)) {
//     chats.push(peerId);
//     writeConfig(config);
//   }
//
//   const schedule = dutiesSchedule.schedule[peerId];
//
//   if (!schedule) {
//     return undefined;
//   }
//
//   const { duties, days } = schedule;
//   const workingDays = days.filter(({ checked }) => checked);
//   const workingDuties = duties
//     .slice(0, workingDays.length)
//     .map((item, idx) => ({
//       ...item,
//       dayNumber: workingDays[idx].value,
//       time: workingDays[idx].time,
//     }));
//
//   return workingDuties.find(({ dayNumber, time }) => {
//     let [hh, mm]: (number | string)[] = time?.split(':') ?? ['00', '00'];
//
//     if (!hh || !mm) {
//       return dayNumber !== day;
//     }
//
//     hh = parseInt(hh);
//     mm = parseInt(mm);
//
//     const sameDay = dayNumber === day;
//     const nextDay = dayNumber === day - 1;
//
//     if (sameDay && hours > hh) {
//       return true;
//     }
//
//     if (sameDay && hours === hh && minutes > mm) {
//       return true;
//     }
//
//     if (nextDay && hours < hh) {
//       return true;
//     }
//
//     if (nextDay && hours === hh && minutes < mm) {
//       return true;
//     }
//
//     return false;
//   });
// }
//
// function addLeadingZero(num: number) {
//   return num > 10 ? `${num}` : `0${num}`;
// }
