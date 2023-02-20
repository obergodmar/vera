import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { IApi, ROUTES } from '@vera-reforged/common';
import { CustomSelectOptionInterface } from '@vkontakte/vkui';
import { ChipOption } from '@vkontakte/vkui/dist/components/Chip/Chip';

import { extendFetchArgs } from '../../utils/extendFetchArgs';

export type Member = ChipOption & {
  peerId: number;
  firstName: string;
  lastName: string;
  avatar: string;
  screenName: string;
};

export const dutyApi = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: ROUTES.duty.baseUrl }),
  reducerPath: 'dutyApi',
  tagTypes: ['Schedule'],
  endpoints: (builder) => ({
    getDutyChats: builder.query<CustomSelectOptionInterface[], void>({
      query() {
        return extendFetchArgs<IApi.IDutyApi.GetChatsRequest>({
          url: 'getChats',
          body: {},
        });
      },
      transformResponse(data: IApi.IDutyApi.GetChatsResponse) {
        return (
          data.items?.reduce((acc: CustomSelectOptionInterface[], item) => {
            const {
              chat_settings,
              peer: { id },
            } = item;

            if (!chat_settings) {
              return acc;
            }
            const { title, photo } = chat_settings;

            acc.push({
              label: title,
              value: id,
              avatar: photo?.photo_100,
              description: id,
            });

            return acc;
          }, []) || []
        );
      },
    }),
    getDutyMembersForChat: builder.query<Member[], number>({
      query(peerId) {
        return extendFetchArgs<IApi.IDutyApi.GetMembersForChatRequest>({
          url: `getMembersForChat`,
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
    getDutyDays: builder.query<IApi.IDutyApi.GetDaysResponse, void>({
      query() {
        return extendFetchArgs<IApi.IDutyApi.GetDaysRequest>({
          url: 'getDays',
          body: {},
        });
      },
    }),
    getDutyScheduleForChat: builder.query<
      IApi.IDutyApi.GetScheduleForChatResponse,
      number
    >({
      query(chatId) {
        return extendFetchArgs<IApi.IDutyApi.GetScheduleForChatRequest>({
          url: 'getScheduleForChat',
          body: {
            chatId,
          },
        });
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ firstName, lastName }, idx) => ({
                type: 'Schedule' as const,
                id: `${firstName}-${lastName}-${idx}`,
              })),
              'Schedule',
            ]
          : ['Schedule'],
    }),
    getDutySchedule: builder.query<IApi.IDutyApi.GetScheduleResponse, void>({
      query() {
        return extendFetchArgs<IApi.IDutyApi.GetScheduleRequest>({
          url: 'getSchedule',
          body: {},
        });
      },
    }),
    updateChatSchedule: builder.mutation<
      IApi.IDutyApi.UpdateChatScheduleResponse,
      Omit<IApi.IDutyApi.UpdateChatScheduleRequest, 'token'>
    >({
      query(body) {
        return extendFetchArgs<IApi.IDutyApi.UpdateChatScheduleRequest>({
          body,
          url: 'updateChatSchedule',
        });
      },
      invalidatesTags: ['Schedule'],
    }),
  }),
});

export const {
  useGetDutyChatsQuery,
  useGetDutyMembersForChatQuery,
  useGetDutyDaysQuery,
  useUpdateChatScheduleMutation,
  useGetDutyScheduleForChatQuery,
} = dutyApi;
