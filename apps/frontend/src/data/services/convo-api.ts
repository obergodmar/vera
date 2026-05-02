import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BotUser, IApi, ROUTES } from '@vera-reforged/common';
import { CustomSelectOptionInterface } from '@vkontakte/vkui';

import { extendFetchArgs } from '../../utils/extendFetchArgs';
import { transformConvosToSelectOptions } from '../../utils/transformConvosToSelectOptions';
import { Member } from '../types';

const { endpoints, baseUrl } = ROUTES.convo;

export const convoApi = createApi({
  baseQuery: fetchBaseQuery({ baseUrl }),
  reducerPath: 'convoApi',
  endpoints: (builder) => ({
    [endpoints.getChats]: builder.query<CustomSelectOptionInterface[], void>({
      query() {
        return extendFetchArgs<IApi.IConvoApi.GetChatsRequest>({
          url: endpoints.getChats,
          body: {},
        });
      },
      transformResponse: transformConvosToSelectOptions,
    }),
    [endpoints.getMembersForChat]: builder.query<Member[], number>({
      query(chatId) {
        return extendFetchArgs<IApi.IConvoApi.GetMembersForChatRequest>({
          url: endpoints.getMembersForChat,
          body: {
            chatId,
          },
        });
      },
      transformResponse(data: IApi.IConvoApi.GetMembersForChatResponse) {
        const { items } = data;

        if (!items) {
          return [];
        }

        return items
          .filter(({ id }) => id !== undefined)
          .map(
            ({
              id: userId,
              photo: avatar = '',
              username = '',
              firstName = '',
              lastName = '',
            }: BotUser) => ({
              label: `${firstName} ${lastName}`,
              value: userId as number,
              avatar,
              username,
              userId: userId as number,
              firstName,
              lastName,
            }),
          )
          .sort((a, b) => a.label.localeCompare(b.label));
      },
    }),
  }),
});

export const { useGetChatsQuery, useGetMembersForChatQuery } = convoApi;
