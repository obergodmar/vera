import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { IApi, ROUTES } from '@vera-reforged/common';

import { extendFetchArgs } from '../../utils/extendFetchArgs';

const { baseUrl, endpoints } = ROUTES.helloMessages;

const tag = 'HelloMessages' as const;

export const helloMessagesApi = createApi({
  baseQuery: fetchBaseQuery({ baseUrl }),
  reducerPath: 'helloMessagesApi',
  tagTypes: [tag],
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
      providesTags: [tag],
    }),
    [endpoints.updateHelloMessage]: builder.mutation<
      IApi.IHelloMessagesApi.UpdateHelloMessageResponse,
      Omit<IApi.IHelloMessagesApi.UpdateHelloMessageRequest, 'token'>
    >({
      query(body) {
        return extendFetchArgs<IApi.IHelloMessagesApi.UpdateHelloMessageRequest>(
          {
            url: endpoints.updateHelloMessage,
            body,
          },
        );
      },
      invalidatesTags: [tag],
    }),
    [endpoints.updateAllHelloMessages]: builder.mutation<
      IApi.IHelloMessagesApi.UpdateAllHelloMessagesResponse,
      Omit<IApi.IHelloMessagesApi.UpdateAllHelloMessagesRequest, 'token'>
    >({
      query(updates) {
        return extendFetchArgs<IApi.IHelloMessagesApi.UpdateAllHelloMessagesRequest>(
          {
            url: endpoints.updateAllHelloMessages,
            body: {
              updates,
            },
          },
        );
      },
      invalidatesTags: [tag],
    }),
  }),
});

export const {
  useGetHelloMessagesQuery,
  useUpdateHelloMessageMutation,
  useUpdateAllHelloMessagesMutation,
} = helloMessagesApi;
