import { Inject, Injectable } from '@nestjs/common';
import { Draft } from '@reduxjs/toolkit';
import {
  filterScheduleByChatAndTag,
  filterScheduleByDay,
  filterScheduleByDayAndTime,
  getAnnounceDutyMessage,
  getDayMonthTime,
  IDuty,
} from '@vera-reforged/common';

import produce from 'immer';
import { MessageContext } from 'vk-io';
import { MessagesConversation } from 'vk-io/lib/api/schemas/objects';

import { ConfigService } from '../config/config.service';
import { LoggerService } from '../logger/logger.service';
import { VkApiService } from '../vk-api/vk-api.service';

const GROUPS_CHATS = ['chat', 'group'];

@Injectable()
export class DutyService {
  private chats: MessagesConversation[] = [];

  public constructor(
    @Inject(VkApiService) private readonly api: VkApiService,
    @Inject(ConfigService) private readonly config: ConfigService,
    @Inject(LoggerService) private readonly logger: LoggerService
  ) {
    // this.api.botService.bot.hear(/duty(\s#?\w+)?/, (msg: MessageContext) => {
    //   const { peerType, peerId, $match } = msg;
    //   const [, hashtag] = $match || [];
    //
    //   const tag = hashtag?.replace(/\s?#?/, '') || null;
    //
    //   this.addChatIfDoesntExist.call(this, peerId, peerType);
    //
    //   const chatAndTagSchedule = this.filterScheduleForChatAndTag.call(
    //     this,
    //     peerId,
    //     tag
    //   );
    //
    //   const currentTimeDuties = this.filterScheduleForCurrentDayAndTime.call(
    //     this,
    //     chatAndTagSchedule
    //   );
    //
    //   const { schedule, noDutyAtCurrentTime } =
    //     this.filterScheduleIfNoDutyAtCurrentTime.call(
    //       this,
    //       currentTimeDuties,
    //       chatAndTagSchedule
    //     );
    //
    //   this.announceDuty.call(this, peerId, schedule, tag, noDutyAtCurrentTime);
    // });
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

  public async getChats() {
    const { chats } = this.getConfig();

    this.logger.log('DutyService: Vera chats were requested');

    if (!chats.length) {
      return { items: [] };
    }

    const convos = await this.api.getConversationsById(chats);

    this.chats =
      convos.items?.filter(({ peer: { type } }) =>
        GROUPS_CHATS.includes(type)
      ) || [];

    return {
      ...convos,
      items: this.chats,
    };
  }

  public async getMembersForChat(chatId: number) {
    return this.api.getConversationMembers(chatId);
  }

  public getDays() {
    const { days } = this.getConfig();

    this.logger.log('DutyService: Duty days were requested');

    return days;
  }

  public getSchedule() {
    const { schedule } = this.getConfig();

    return schedule;
  }

  public getScheduleForChat(chatId: number) {
    const { schedule } = this.getConfig();

    this.logger.log(
      `DutyService: Duty schedule for chat ${this.getChatNameFromCache(
        chatId
      )} was requested`
    );

    return schedule.filter((duties) => duties.chatId === chatId);
  }

  public async updateChatSchedule(
    chatId: number,
    chatSchedule: IDuty.Schedule[]
  ) {
    const status = await this.updateConfig((duty) => {
      const othersSchedule = duty.schedule.filter(
        (duty) => duty.chatId !== chatId
      );

      duty.schedule = [...othersSchedule, ...chatSchedule];
    });

    if (typeof status === 'string') {
      this.logger.log(
        `DutyService: An error occurred in ${this.getChatNameFromCache(
          chatId
        )}: ${status}`
      );

      return {
        error: status,
      };
    }

    this.logger.log(
      `DutyService: Changes were made in ${this.getChatNameFromCache(chatId)}`
    );

    return {
      success: true,
    };
  }

  private getChatNameFromCache(chatId: number) {
    const chatName = this.chats.find(({ peer: { id } }) => id === chatId)
      ?.chat_settings?.title;

    return chatName ? `${chatName} (${chatId})` : chatId;
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

  private filterScheduleForChatAndTag(chatId: number, tag: string | null) {
    const { schedule }: IDuty.IDuty = this.getConfig();

    return filterScheduleByChatAndTag(schedule, chatId, tag);
  }

  private addChatIfDoesntExist(chatId: number, peerType: string) {
    const { chats } = this.getConfig();

    if (GROUPS_CHATS.includes(peerType)) {
      this.logger.log(
        `DutyService: A duty was requested in ${this.getChatNameFromCache(
          chatId
        )}`
      );

      if (!chats.includes(chatId)) {
        this.api.botService.vk.api.messages.send({
          peer_id: chatId,
          message: 'Возможность установки дежурства включена',
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
      `DutyService: A duty was requested by peer ${chatId} in personal chat`
    );
  }

  private getConfig() {
    const { duty } = this.config.getConfig();

    return duty;
  }

  private async updateConfig(
    recipe: (duty: Draft<IDuty.IDuty>) => void
  ): Promise<true | string> {
    return this.config.updateConfig((config) => {
      config.duty = produce(config.duty, recipe);
    });
  }
}
