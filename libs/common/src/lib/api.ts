import { MessagesConversation } from 'vk-io/lib/api/schemas/objects';
import { MessagesGetConversationMembersResponse } from 'vk-io/lib/api/schemas/responses';

import { IDuty } from './duty';

export namespace IApi {
  export type TokenRequest<T = Record<string, any>> = {
    token: string;
  } & T;

  export type WithChatId<T = Record<string, any>> = {
    chatId: number;
  } & T;

  export type StatusResponse = {
    success?: boolean;
    error?: string;
  };

  export type ConversationsList = {
    count: number;
    items: MessagesConversation[];
  };

  export namespace IDutyApi {
    export type Requests =
      | GetChatsRequest
      | GetMembersForChatRequest
      | GetDaysRequest
      | GetScheduleForChatRequest
      | GetScheduleRequest
      | UpdateChatScheduleRequest;

    export type GetChatsRequest = TokenRequest;
    export type GetChatsResponse = ConversationsList;

    export type GetMembersForChatRequest = TokenRequest<WithChatId>;
    export type GetMembersForChatResponse =
      MessagesGetConversationMembersResponse;

    export type GetDaysRequest = TokenRequest;
    export type GetDaysResponse = IDuty.Day[];

    export type GetScheduleForChatRequest = TokenRequest<WithChatId>;
    export type GetScheduleForChatResponse = IDuty.Schedule[] | null;

    export type GetScheduleRequest = TokenRequest;
    export type GetScheduleResponse = IDuty.Schedule[];

    export type UpdateChatScheduleRequest = TokenRequest<
      WithChatId<{
        schedule: IDuty.Schedule[];
      }>
    >;
    export type UpdateChatScheduleResponse = StatusResponse;
  }

  export namespace IHelloMessagesApi {
    export type Requests = GetChatsRequest;

    export type GetChatsRequest = TokenRequest;
    export type GetChatsResponse = ConversationsList;
  }
}
