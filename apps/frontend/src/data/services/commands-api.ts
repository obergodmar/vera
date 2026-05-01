import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { IApi, ROUTES } from '@vera-reforged/common';

import { extendFetchArgs } from '../../utils/extendFetchArgs';

const { baseUrl, endpoints } = ROUTES.commands;

const tag = 'Commands' as const;

export const commandsApi = createApi({
  baseQuery: fetchBaseQuery({ baseUrl }),
  reducerPath: 'commandsApi',
  tagTypes: [tag],
  endpoints: (builder) => ({
    [endpoints.createRollCommandForChat]: builder.mutation<
      IApi.ICommandsApi.CreateRollCommandForChatResponse,
      Omit<IApi.ICommandsApi.CreateRollCommandForChatRequest, 'token'>
    >({
      query(body) {
        return extendFetchArgs<IApi.ICommandsApi.CreateRollCommandForChatRequest>(
          {
            url: endpoints.createRollCommandForChat,
            body,
          },
        );
      },
      invalidatesTags: [tag],
    }),
    [endpoints.updateRollCommandForChat]: builder.mutation<
      IApi.ICommandsApi.UpdateRollCommandForChatResponse,
      Omit<IApi.ICommandsApi.UpdateRollCommandForChatRequest, 'token'>
    >({
      query(body) {
        return extendFetchArgs<IApi.ICommandsApi.UpdateRollCommandForChatRequest>(
          {
            url: endpoints.updateRollCommandForChat,
            body,
          },
        );
      },
      invalidatesTags: [tag],
    }),
    [endpoints.deleteRollCommandForChat]: builder.mutation<
      IApi.ICommandsApi.DeleteRollCommandForChatResponse,
      Omit<IApi.ICommandsApi.DeleteRollCommandForChatRequest, 'token'>
    >({
      query(body) {
        return extendFetchArgs<IApi.ICommandsApi.DeleteRollCommandForChatRequest>(
          {
            url: endpoints.deleteRollCommandForChat,
            body,
          },
        );
      },
      invalidatesTags: [tag],
    }),

    [endpoints.getCommandsForChat]: builder.query<
      IApi.ICommandsApi.GetCommandsForChatResponse,
      Omit<IApi.ICommandsApi.GetCommandsForChatRequest, 'token'>
    >({
      query(body) {
        return extendFetchArgs<IApi.ICommandsApi.GetCommandsChatsRequest>({
          url: endpoints.getCommandsForChat,
          body,
        });
      },
      providesTags: [tag],
    }),
    [endpoints.getCommandsChats]: builder.query<
      IApi.ICommandsApi.GetCommandsChatsResponse,
      Omit<IApi.ICommandsApi.GetCommandsChatsRequest, 'token'>
    >({
      query(body) {
        return extendFetchArgs<IApi.ICommandsApi.GetCommandsChatsRequest>({
          url: endpoints.getCommandsChats,
          body,
        });
      },
      providesTags: [tag],
    }),
    [endpoints.disableCommandsForChat]: builder.mutation<
      IApi.ICommandsApi.DisableCommandsForChatResponse,
      Omit<IApi.ICommandsApi.DisableCommandsForChatRequest, 'token'>
    >({
      query(body) {
        return extendFetchArgs<IApi.ICommandsApi.DisableCommandsForChatRequest>(
          {
            url: endpoints.disableCommandsForChat,
            body,
          },
        );
      },
      invalidatesTags: [tag],
    }),
    [endpoints.disableAllCommands]: builder.mutation<
      IApi.ICommandsApi.DisableAllCommandsResponse,
      Omit<IApi.ICommandsApi.DisableAllCommandsRequest, 'token'>
    >({
      query(body) {
        return extendFetchArgs<IApi.ICommandsApi.DisableAllCommandsRequest>({
          url: endpoints.disableAllCommands,
          body,
        });
      },
      invalidatesTags: [tag],
    }),
  }),
});

export const {
  useGetCommandsChatsQuery,
  useGetCommandsForChatQuery,

  useCreateRollCommandForChatMutation,
  useUpdateRollCommandForChatMutation,
  useDeleteRollCommandForChatMutation,

  useDisableCommandsForChatMutation,
  useDisableAllCommandsMutation,
} = commandsApi;
