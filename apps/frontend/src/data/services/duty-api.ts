import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { IApi, ROUTES } from '@vera-reforged/common';
import { CustomSelectOptionInterface } from '@vkontakte/vkui';
import { ChipOption } from '@vkontakte/vkui/dist/components/Chip/Chip';

import { extendFetchArgs } from '../../utils/extendFetchArgs';
import { transformConvosToSelectOptions } from '../../utils/transformConvosToSelectOptions';

export type Member = ChipOption & {
  peerId: number;
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
    [endpoints.getChats]: builder.query<CustomSelectOptionInterface[], void>({
      query() {
        return extendFetchArgs<IApi.IDutyApi.GetChatsRequest>({
          url: endpoints.getChats,
          body: {},
        });
      },
      transformResponse: transformConvosToSelectOptions,
    }),
    [endpoints.getMembersForChat]: builder.query<Member[], number>({
      query(peerId) {
        return extendFetchArgs<IApi.IDutyApi.GetMembersForChatRequest>({
          url: endpoints.getMembersForChat,
          body: {
            chatId: peerId,
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
              id: peerId,
              photo_100: avatar = '',
              screen_name: screenName = '',
              first_name: firstName,
              last_name: lastName,
            }) => ({
              label: `${firstName} ${lastName}`,
              value: peerId,
              avatar,
              screenName,
              peerId,
              firstName,
              lastName,
            })
          )
          .sort((a, b) => a.label.localeCompare(b.label));
      },
    }),
    [endpoints.getDays]: builder.query<IApi.IDutyApi.GetDaysResponse, void>({
      query() {
        return extendFetchArgs<IApi.IDutyApi.GetDaysRequest>({
          url: endpoints.getDays,
          body: {},
        });
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
    [endpoints.getSchedule]: builder.query<
      IApi.IDutyApi.GetScheduleResponse,
      void
    >({
      query() {
        return extendFetchArgs<IApi.IDutyApi.GetScheduleRequest>({
          url: endpoints.getSchedule,
          body: {},
        });
      },
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
  useGetChatsQuery,
  useGetDaysQuery,
  useGetMembersForChatQuery,
  useGetScheduleForChatQuery,
  useUpdateChatScheduleMutation,
} = dutyApi;
