import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { IApi, ROUTES } from '@vera-reforged/common';

import { extendFetchArgs } from '../../utils/extendFetchArgs';

const { baseUrl, endpoints } = ROUTES.duty;
const tag = 'Schedule' as const;

export const dutyApi = createApi({
  baseQuery: fetchBaseQuery({ baseUrl }),
  reducerPath: 'dutyApi',
  tagTypes: [tag],
  endpoints: (builder) => ({
    [endpoints.getScheduleForChat]: builder.query<
      IApi.IDutyApi.GetScheduleForChatResponse,
      number
    >({
      query(chatId) {
        return extendFetchArgs<IApi.IDutyApi.GetScheduleForChatRequest>({
          url: endpoints.getScheduleForChat,
          body: {
            chatId,
          },
        });
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ firstName, lastName }, idx) => ({
                type: tag,
                id: `${firstName}-${lastName}-${idx}`,
              })),
              tag,
            ]
          : [tag],
    }),
    [endpoints.updateChatSchedule]: builder.mutation<
      IApi.IDutyApi.UpdateChatScheduleResponse,
      Omit<IApi.IDutyApi.UpdateChatScheduleRequest, 'token'>
    >({
      query(body) {
        return extendFetchArgs<IApi.IDutyApi.UpdateChatScheduleRequest>({
          body,
          url: endpoints.updateChatSchedule,
        });
      },
      invalidatesTags: [tag],
    }),
  }),
});

export const { useGetScheduleForChatQuery, useUpdateChatScheduleMutation } =
  dutyApi;
