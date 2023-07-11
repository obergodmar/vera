import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/dist/query/react';
import { IApi, ROUTES } from '@vera-reforged/common';
import { CustomSelectOptionInterface } from '@vkontakte/vkui';

import { extendFetchArgs } from '../../utils/extendFetchArgs';
import { transformConvosToSelectOptions } from '../../utils/transformConvosToSelectOptions';

const { endpoints, baseUrl } = ROUTES.convo;

export const convoApi = createApi({
  baseQuery: fetchBaseQuery({ baseUrl }),
  reducerPath: 'convoApi',
  endpoints: (builder) => ({
    [endpoints.getChats]: builder.query<CustomSelectOptionInterface[], void>({
      query() {
        return extendFetchArgs<IApi.IConvoApi.GetChatsRequest>({
          url: endpoints.getChats,
          body: {},
        });
      },
      transformResponse: transformConvosToSelectOptions,
    }),
  }),
});

export const { useGetChatsQuery } = convoApi;
