import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/dist/query/react';
import { IApi, ROUTES } from '@vera-reforged/common';
import { CustomSelectOptionInterface } from '@vkontakte/vkui';

import { extendFetchArgs } from '../../utils/extendFetchArgs';
import { transformConvosToSelectOptions } from '../../utils/transformConvosToSelectOptions';

export const helloMessagesApi = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: ROUTES.helloMessages.baseUrl }),
  reducerPath: 'helloMessagesApi',
  endpoints: (builder) => ({
    getChats: builder.query<CustomSelectOptionInterface[], void>({
      query() {
        return extendFetchArgs<IApi.IHelloMessagesApi.GetChatsRequest>({
          url: 'getChats',
          body: {},
        });
      },
      transformResponse: transformConvosToSelectOptions,
    }),
  }),
});

export const { useGetChatsQuery } = helloMessagesApi;
