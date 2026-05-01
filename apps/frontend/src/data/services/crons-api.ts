import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { IApi, ROUTES } from '@vera-reforged/common';

import { extendFetchArgs } from '../../utils/extendFetchArgs';

const { baseUrl, endpoints } = ROUTES.crons;

const tag = 'Crons' as const;

export const cronsApi = createApi({
  baseQuery: fetchBaseQuery({ baseUrl }),
  reducerPath: 'cronsApi',
  tagTypes: [tag],
  endpoints: (builder) => ({
    [endpoints.createCronForChat]: builder.mutation<
      IApi.ICronsApi.CreateCronForChatResponse,
      Omit<IApi.ICronsApi.CreateCronForChatRequest, 'token'>
    >({
      query(body) {
        return extendFetchArgs<IApi.ICronsApi.CreateCronForChatRequest>({
          url: endpoints.createCronForChat,
          body,
        });
      },
      invalidatesTags: [tag],
    }),
    [endpoints.getCronsForChat]: builder.query<
      IApi.ICronsApi.GetCronsForChatResponse,
      Omit<IApi.ICronsApi.GetCronsForChatRequest, 'token'>
    >({
      query(body) {
        return extendFetchArgs<IApi.ICronsApi.GetCronsForChatRequest>({
          url: endpoints.getCronsForChat,
          body,
        });
      },
      providesTags: [tag],
    }),
    [endpoints.getCronsChats]: builder.query<
      IApi.ICronsApi.GetCronsChatsResponse,
      Omit<IApi.ICronsApi.GetCronsChatsRequest, 'token'>
    >({
      query(body) {
        return extendFetchArgs<IApi.ICronsApi.GetCronsChatsRequest>({
          url: endpoints.getCronsChats,
          body,
        });
      },
      providesTags: [tag],
    }),
    [endpoints.updateCronForChat]: builder.mutation<
      IApi.ICronsApi.UpdateCronForChatResponse,
      Omit<IApi.ICronsApi.UpdateCronForChatRequest, 'token'>
    >({
      query(body) {
        return extendFetchArgs<IApi.ICronsApi.UpdateCronForChatRequest>({
          url: endpoints.updateCronForChat,
          body,
        });
      },
      invalidatesTags: [tag],
    }),
    [endpoints.disableCronsForChat]: builder.mutation<
      IApi.ICronsApi.DisableCronsForChatResponse,
      Omit<IApi.ICronsApi.DisableCronsForChatRequest, 'token'>
    >({
      query(body) {
        return extendFetchArgs<IApi.ICronsApi.DisableCronsForChatRequest>({
          url: endpoints.disableCronsForChat,
          body,
        });
      },
      invalidatesTags: [tag],
    }),
    [endpoints.disableAllCrons]: builder.mutation<
      IApi.ICronsApi.DisableAllCronsResponse,
      Omit<IApi.ICronsApi.DisableAllCronsRequest, 'token'>
    >({
      query(body) {
        return extendFetchArgs<IApi.ICronsApi.DisableAllCronsRequest>({
          url: endpoints.disableAllCrons,
          body,
        });
      },
      invalidatesTags: [tag],
    }),
  }),
});

export const {
  useGetCronsForChatQuery,
  useGetCronsChatsQuery,
  useCreateCronForChatMutation,
  useUpdateCronForChatMutation,
  useDisableCronsForChatMutation,
  useDisableAllCronsMutation,
} = cronsApi;
