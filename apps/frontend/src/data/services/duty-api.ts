import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { IApi, ROUTES } from '@vera-reforged/common';
import { ChipOption } from '@vkontakte/vkui/dist/components/Chip/Chip';

import { extendFetchArgs } from '../../utils/extendFetchArgs';

export type Member = ChipOption & {
  userId: number;
  firstName: string;
  lastName: string;
  avatar: string;
  screenName: string;
};

const { baseUrl, endpoints } = ROUTES.duty;
const tag = 'Schedule' as const;

export const dutyApi = createApi({
  baseQuery: fetchBaseQuery({ baseUrl }),
  reducerPath: 'dutyApi',
  tagTypes: [tag],
  endpoints: (builder) => ({
    [endpoints.getMembersForChat]: builder.query<Member[], number>({
      query(chatId) {
        return extendFetchArgs<IApi.IDutyApi.GetMembersForChatRequest>({
          url: endpoints.getMembersForChat,
          body: {
            chatId,
          },
        });
      },
      transformResponse(data: IApi.IDutyApi.GetMembersForChatResponse) {
        const { profiles } = data;

        if (!profiles) {
          return [];
        }

        return profiles
          .map(
            ({
              id: userId,
              photo_100: avatar = '',
              screen_name: screenName = '',
              first_name: firstName = '',
              last_name: lastName = '',
            }) => ({
              label: `${firstName} ${lastName}`,
              value: userId,
              avatar,
              screenName,
              userId,
              firstName,
              lastName,
            }),
          )
          .sort((a, b) => a.label.localeCompare(b.label));
      },
    }),
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

export const {
  useGetMembersForChatQuery,
  useGetScheduleForChatQuery,
  useUpdateChatScheduleMutation,
} = dutyApi;
