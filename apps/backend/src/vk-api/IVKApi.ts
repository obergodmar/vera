import { NonEmptyArray, Opaque } from '@vera-reforged/common';
import {
  GroupsGetByIdParams,
  GroupsGetByIdResponse,
  MessagesGetConversationMembersParams,
  MessagesGetConversationMembersResponse,
  MessagesGetConversationsByIdExtendedResponse,
  MessagesGetConversationsByIdParams,
  MessagesSendParams,
  UsersGetParams,
  UsersGetResponse,
} from '@vkontakte/api-schema-typescript';

import { MessagesSendResponse } from 'vk-io/lib/api/schemas/responses';

export namespace IVKApi {
  export interface IVKApi {
    fetch<Method extends keyof Request, TrackIdMethod extends Method = Method>(
      method: Method,
      params: Request[Method]['params'],
      opts?: Options<TrackIdMethod>,
    ): Promise<Request[Method]['response']>;

    fetchMany<RS extends TypedExecuteReq[]>(
      reqs: [...RS],
      opts?: Options<'execute'>,
    ): Promise<{ [i in keyof RS]: TypedExecuteRes<RS[i]> }>;

    fetchSeq<RS extends TypedExecuteReq[]>(
      reqs: [...RS],
      opts?: Options<'execute'>,
    ): Promise<{ [i in keyof RS]: TypedExecuteRes<RS[i]> }>;

    dangerouslyAbort(trackId: TrackId<keyof Request>): void;
  }

  export type TypedExecuteReq<
    Method extends Exclude<keyof Request, 'execute'> = Exclude<
      keyof Request,
      'execute'
    >,
  > = TypedExecuteReqParams<Method> | null | false | undefined;

  type TypedExecuteReqParams<Method extends keyof Request> =
    Method extends keyof Request
      ? {
          method: Method;
          params: Request[Method]['params'];
        }
      : never;

  export type TypedExecuteRes<Req extends TypedExecuteReq> =
    Req extends Exclude<TypedExecuteReq, null | undefined | false>
      ? Request[Req['method']]['response']
      : null;

  export type Request = EnforceExtended<
    EnforceSkipFields<EnforceGroupId<WeakRequest>>
  >;

  export type WeakRequest = {
    // execute
    execute: {
      params: { code: string };
      response: any;
    };

    'messages.send': {
      params: MessagesSendParams;
      response: MessagesSendResponse;
    };

    'messages.getConversationsById': {
      params: MessagesGetConversationsByIdParams;
      response: MessagesGetConversationsByIdExtendedResponse;
    };
    'messages.getConversationMembers': {
      params: MessagesGetConversationMembersParams;
      response: MessagesGetConversationMembersResponse;
    };

    // users
    'users.get': {
      params: UsersGetParams;
      response: UsersGetResponse;
    };

    // groups
    'groups.getById': {
      params: GroupsGetByIdParams;
      response: GroupsGetByIdResponse;
    };
  };

  type EnforceExtended<R extends WeakRequest> = {
    [K in keyof WeakRequest]: Required<R[K]['params']> extends {
      extended: 0 | 1;
    }
      ? {
          params: R[K]['params'] & { extended: 0 | 1; fields?: never };
          response: R[K]['response'];
        }
      : R[K];
  };

  type EnforceSkipFields<R extends WeakRequest> = {
    [K in keyof WeakRequest]: K extends `${SkipFieldsScopes}.${string}`
      ? Required<R[K]['params']> extends { fields: string }
        ? {
            params: R[K]['params'] & { fields?: never };
            response: R[K]['response'];
          }
        : R[K]
      : R[K];
  };
  export type SkipFieldsScopes = 'users' | 'groups';

  type EnforceGroupId<R extends WeakRequest> = {
    [K in keyof WeakRequest]: K extends `messages.${string}`
      ? R[K]['params'] extends { group_id?: number }
        ? {
            params: R[K]['params'] & { group_id: number };
            response: R[K]['response'];
          }
        : R[K]
      : R[K];
  };

  export type Options<Method extends keyof Request> = {
    timeout?: number;
    retries?: number;
    trackId?: TrackId<Method>;
    omitExecuteLogs?: boolean;
  };

  export type TrackId<Method extends keyof Request> = Opaque<
    `${Method}-${string}`,
    Request
  >;

  export function resolveTrackId<Method extends keyof Request>(
    method: Method,
    tracker: string,
  ): TrackId<Method> {
    if (tracker.length === 0) {
      throw new Error('Нельзя отдавать пустую строку в IApi.resolveTrackId');
    }

    return `${method}-${tracker}` as TrackId<Method>;
  }

  export class AuthError extends Error {
    constructor(message: string) {
      super(message);

      Object.setPrototypeOf(this, AuthError.prototype);
    }
  }

  export class TimeoutError extends Error {
    constructor(message: string) {
      super(message);

      Object.setPrototypeOf(this, TimeoutError.prototype);
    }
  }

  export class AbortError extends Error {
    constructor(message: string) {
      super(message);

      Object.setPrototypeOf(this, AbortError.prototype);
    }
  }

  export class RequestError extends Error {
    constructor(
      public readonly code: number,
      message: string,
      public readonly apiError: Record<string, unknown>,
    ) {
      super(message);

      Object.setPrototypeOf(this, RequestError.prototype);
    }
  }

  export class ExecuteErrors extends Error {
    constructor(
      public readonly list: NonEmptyArray<RequestError>,
      // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
      public readonly response: any,
    ) {
      super(list[0].message);

      Object.setPrototypeOf(this, ExecuteErrors.prototype);
    }
  }
}
