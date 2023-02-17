import { Inject, Injectable } from '@nestjs/common';
import { Draft } from '@reduxjs/toolkit';
import { IConfig, IDuty } from '@vera-reforged/common';

import produce from 'immer';
import {
  MessagesGetConversationMembersResponse,
  MessagesGetConversationsByIdResponse,
} from 'vk-io/lib/api/schemas/responses';

import { ConfigService } from '../config/config.service';
import { VkApiService } from '../vk-api/vk-api.service';

@Injectable()
export class DutyService {
  public constructor(
    @Inject(VkApiService) private readonly api: VkApiService,
    @Inject(ConfigService) private readonly config: ConfigService
  ) {
    this.api.botService.bot.hear(/duty/, (msg: any) => {
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
    });
  }

  public async getChats() {
    const { chats } = this.getConfig();

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

    return schedule.find((duties) => duties.chatId === chatId) || null;
  }

  public addChat(chatId: number) {
    if (typeof chatId !== 'number' || Number.isNaN(chatId)) {
      return;
    }

    this.updateConfig(({ chats }) => chats.push(chatId));
  }

  public updateSchedule(duty: IDuty.Schedule[]) {
    const status = this.updateConfig(({ schedule }) => schedule.push(duty));

    if (typeof status === 'string') {
      return {
        error: status,
      };
    }

    return {
      success: true,
    };
  }

  private getConfig() {
    const { duty } = this.config.getConfig();

    return duty;
  }

  private updateConfig(recipe: (duty: Draft<IDuty.IDuty>) => void) {
    return this.config.updateConfig(({ duty }) => recipe(duty));
  }
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
