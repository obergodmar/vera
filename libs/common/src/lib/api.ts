import {
  MessagesGetConversationMembersResponse,
  MessagesGetConversationsByIdResponse,
} from 'vk-io/lib/api/schemas/responses';

import { IDuty } from './duty';

export namespace IApi {
  export interface IDutyApi {
    getChats: {
      request: void;
      response: MessagesGetConversationsByIdResponse;
    };

    getMembersForChat: {
      request: number /** Param chatId */;
      response: MessagesGetConversationMembersResponse;
    };

    getDays: {
      request: void;
      response: IDuty.Day[];
    };

    getScheduleForChat: {
      request: number /** Param chatId */;
      response: IDuty.Schedule | null;
    };

    getSchedule: {
      request: void;
      response: IDuty.Schedule[];
    };

    updateSchedule: {
      request: {
        schedule: IDuty.Schedule[];
      };
      response: IStatusResponse;
    };
  }

  export interface IStatusResponse {
    success?: boolean;
    error?: string;
  }
}
