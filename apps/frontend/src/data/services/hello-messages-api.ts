import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/dist/query/react';
import { IApi, ROUTES } from '@vera-reforged/common';

import { extendFetchArgs } from '../../utils/extendFetchArgs';

const { baseUrl, endpoints } = ROUTES.helloMessages;

export const helloMessagesApi = createApi({
  baseQuery: fetchBaseQuery({ baseUrl }),
  reducerPath: 'helloMessagesApi',
  endpoints: (builder) => ({
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

export const { useGetHelloMessagesQuery } = helloMessagesApi;
