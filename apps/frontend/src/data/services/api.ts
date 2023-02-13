import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
  MessagesGetConversationMembersResponse,
  MessagesGetConversationsByIdResponse,
} from '@vkontakte/api-schema-typescript';
import { CustomSelectOptionInterface } from '@vkontakte/vkui';
import { ChipOption } from '@vkontakte/vkui/dist/components/Chip/Chip';

import { extendFetchArgs } from '../../utils/extendFetchArgs';

export type Member = ChipOption & {
  peerId: number;
  firstName: string;
  lastName: string;
  avatar: string;
  screenName: string;
};

export const api = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  reducerPath: 'api',
  endpoints: (builder) => ({
    getConversations: builder.query<CustomSelectOptionInterface[], void>({
      query() {
        return extendFetchArgs({
          url: 'getConversations',
        });
      },
      transformResponse(data: MessagesGetConversationsByIdResponse) {
        return data.items
          .filter(({ peer: { type } }) => type === 'chat')
          .reduce((acc: CustomSelectOptionInterface[], item) => {
            const {
              chat_settings,
              peer: { id },
            } = item;

            if (!chat_settings) {
              return acc;
            }
            const { title, photo } = chat_settings;

            acc.push({
              label: title,
              value: id,
              avatar: photo?.photo_100,
              description: id,
            });

            return acc;
          }, []);
      },
    }),
    getConversationMembers: builder.query<Member[], number>({
      query(peerId) {
        return extendFetchArgs({
          url: `getConversationMembers/${peerId}`,
        });
      },
      transformResponse(data: MessagesGetConversationMembersResponse) {
        const { profiles } = data;

        if (!profiles) {
          return [];
        }

        return profiles
          .map(
            ({
              id: peerId,
              photo_100: avatar = '',
              screen_name: screenName = '',
              first_name: firstName,
              last_name: lastName,
            }) => ({
              label: `${firstName} ${lastName}`,
              value: peerId,
              avatar,
              screenName,
              peerId,
              firstName,
              lastName,
            })
          )
          .sort((a, b) => a.label.localeCompare(b.label));
      },
    }),
  }),
});

export const { useGetConversationsQuery, useGetConversationMembersQuery } = api;
