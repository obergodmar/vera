import { VKSilentUser } from '@vkontakte/superappkit';
import { MessagesGetConversationMembersResponse } from '@example/api-schema-typescript';

import { MessagesConversation } from 'vk-io/lib/api/schemas/objects';

import { ICrons } from './crons';
import { IDuty } from './duty';
import { IHelloMessages } from './hello-messages';
import { IReactions } from './reactions';

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

  export namespace IAuthApi {
    export type AuthRequest = {
      data: { token: string; uuid: string; user: VKSilentUser };
    };
    export type AuthResponse = StatusResponse & { token: string };
  }

  export namespace IConvoApi {
    export type GetChatsRequest = TokenRequest;
    export type GetChatsResponse = ConversationsList;
  }

  export namespace IDutyApi {
    export type GetMembersForChatRequest = TokenRequest<WithChatId>;
    export type GetMembersForChatResponse =
      MessagesGetConversationMembersResponse;

    export type GetDaysRequest = TokenRequest;
    export type GetDaysResponse = IDuty.Day[];

    export type GetScheduleForChatRequest = TokenRequest<WithChatId>;
    export type GetScheduleForChatResponse = IDuty.Schedule[];

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
    export type GetHelloMessagesRequest = TokenRequest;
    export type GetHelloMessagesResponse = {
      count: number;
      items: ConvoListWithMessages[];
    };

    export type UpdateHelloMessageRequest = TokenRequest<WithChatId> & {
      message: IHelloMessages.Message;
    };
    export type UpdateHelloMessageResponse = StatusResponse;

    export type UpdateAllHelloMessagesRequest = TokenRequest & {
      updates: IHelloMessages.MessagePerChat[];
    };
    export type UpdateAllHelloMessagesResponse = StatusResponse;

    export type ConvoListWithMessages = MessagesConversation & {
      helloMessage: IHelloMessages.Message;
    };
  }

  export namespace IReactionsApi {
    export type GetReactionsForChatRequest = TokenRequest<WithChatId>;
    export type GetReactionsForChatResponse = {
      count: number;
      items: IReactions.ChatReaction[];
    };

    export type CreateReactionForChatRequest = TokenRequest<
      Omit<IReactions.ChatReaction, 'id'>
    >;
    export type CreateReactionForChatResponse = StatusResponse;

    export type UpdateReactionForChatRequest =
      TokenRequest<IReactions.ChatReaction>;
    export type UpdateReactionForChatResponse = StatusResponse;
  }

  export namespace ICronsApi {
    export type Requests = '';

    export type GetCronsForChatRequest = TokenRequest<WithChatId>;
    export type GetCronsForChatResponse = {
      count: number;
      items: ICrons.ChatCron[];
    };

    export type GetCronsChatsRequest = TokenRequest;
    export type GetCronsChatsResponse = {
      count: number;
      items: number[];
    };

    export type CreateCronForChatRequest = TokenRequest<
      Omit<ICrons.ChatCron, 'id'>
    >;
    export type CreateCronForChatResponse = StatusResponse;

    export type UpdateCronForChatRequest = TokenRequest<ICrons.ChatCron>;
    export type UpdateCronForChatResponse = StatusResponse;

    export type DisableCronsForChatRequest = TokenRequest<WithChatId>;
    export type DisableCronsForChatResponse = StatusResponse & {
      count?: number;
    };

    export type DisableAllCronsRequest = TokenRequest;
    export type DisableAllCronsResponse = StatusResponse & {
      count?: number;
    };
  }
}
