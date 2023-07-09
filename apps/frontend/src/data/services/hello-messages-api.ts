import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/dist/query/react';
import { IApi, ROUTES } from '@vera-reforged/common';
import { CustomSelectOptionInterface } from '@vkontakte/vkui';

import { extendFetchArgs } from '../../utils/extendFetchArgs';
import { transformConvosToSelectOptions } from '../../utils/transformConvosToSelectOptions';

const { baseUrl, endpoints } = ROUTES.helloMessages;

export const helloMessagesApi = createApi({
  baseQuery: fetchBaseQuery({ baseUrl }),
  reducerPath: 'helloMessagesApi',
  endpoints: (builder) => ({
    [endpoints.getChats]: builder.query<CustomSelectOptionInterface[], void>({
      query() {
        return extendFetchArgs<IApi.IHelloMessagesApi.GetChatsRequest>({
          url: endpoints.getChats,
          body: {},
        });
      },
      transformResponse: transformConvosToSelectOptions,
    }),
    [endpoints.getHelloMessages]: builder.query<
      IApi.IHelloMessagesApi.GetHelloMessagesResponse,
      void
    >({
      query() {
        return extendFetchArgs<IApi.IHelloMessagesApi.GetHelloMessagesRequest>({
          url: endpoints.getHelloMessages,
          body: {},
        });
      },
    }),
  }),
});

export const { useGetChatsQuery, useGetHelloMessagesQuery } = helloMessagesApi;
