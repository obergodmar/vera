import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
  MessagesGetConversationMembersResponse,
  MessagesGetConversationsByIdResponse,
} from '@vkontakte/api-schema-typescript';
import { CustomSelectOptionInterface } from '@vkontakte/vkui';
import { ChipOption } from '@vkontakte/vkui/dist/components/Chip/Chip';

const API = 'http://localhost:3333/api/methods';

export const api = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: API }),
  reducerPath: 'api',
  endpoints: (builder) => ({
    getConversations: builder.query<CustomSelectOptionInterface[], void>({
      query() {
        return {
          method: 'GET',
          url: 'getConversations',
        };
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
    getConversationMembers: builder.query<ChipOption[], number>({
      query(peerId) {
        return {
          method: 'GET',
          url: `getConversationMembers/${peerId}`,
        };
      },
      transformResponse(data: MessagesGetConversationMembersResponse) {
        const { profiles } = data;

        if (!profiles) {
          return [];
        }

        return profiles
          .map(({ id, photo_100, screen_name, first_name, last_name }) => ({
            label: `${first_name} ${last_name}`,
            value: id,
            avatar: photo_100,
            description: screen_name,
          }))
          .sort((a, b) => a.label.localeCompare(b.label));
      },
    }),
  }),
});

export const { useGetConversationsQuery, useGetConversationMembersQuery } = api;
