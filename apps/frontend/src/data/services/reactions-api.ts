import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/dist/query/react';
import { IApi, ROUTES } from '@vera-reforged/common';

import { extendFetchArgs } from '../../utils/extendFetchArgs';

const { baseUrl, endpoints } = ROUTES.reactions;

const tag = 'Reactions' as const;

export const reactionsApi = createApi({
  baseQuery: fetchBaseQuery({ baseUrl }),
  reducerPath: 'reactionsApi',
  tagTypes: [tag],
  endpoints: (builder) => ({
    [endpoints.createReactionForChat]: builder.mutation<
      IApi.IReactionsApi.CreateReactionForChatResponse,
      Omit<IApi.IReactionsApi.CreateReactionForChatRequest, 'token'>
    >({
      query(body) {
        return extendFetchArgs<IApi.IReactionsApi.CreateReactionForChatRequest>(
          {
            url: endpoints.createReactionForChat,
            body,
          }
        );
      },
      invalidatesTags: [tag],
    }),
    [endpoints.getReactionsForChat]: builder.query<
      IApi.IReactionsApi.GetReactionsForChatResponse,
      Omit<IApi.IReactionsApi.GetReactionsForChatRequest, 'token'>
    >({
      query(body) {
        return extendFetchArgs<IApi.IReactionsApi.GetReactionsForChatRequest>({
          url: endpoints.getReactionsForChat,
          body,
        });
      },
      providesTags: [tag],
    }),
    [endpoints.updateReactionsForChat]: builder.mutation<
      IApi.IReactionsApi.UpdateReactionForChatResponse,
      Omit<IApi.IReactionsApi.UpdateReactionForChatRequest, 'token' | 'id'>
    >({
      query(body) {
        return extendFetchArgs<
          Omit<IApi.IReactionsApi.UpdateReactionForChatRequest, 'id'>
        >({
          url: endpoints.updateReactionsForChat,
          body,
        });
      },
      invalidatesTags: [tag],
    }),
  }),
});

export const {
  useCreateReactionForChatMutation,
  useGetReactionsForChatQuery,
  useUpdateReactionsForChatMutation,
} = reactionsApi;
