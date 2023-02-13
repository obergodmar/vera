import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { IConfig } from '@vera-reforged/common';

import { extendFetchArgs } from '../../utils/extendFetchArgs';
import { getToken } from '../../utils/getToken';

export const configApi = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  reducerPath: 'configApi',
  endpoints: (builder) => ({
    getConfig: builder.query<IConfig.IConfig, void>({
      query() {
        return extendFetchArgs({
          url: '/getConfig',
          body: {
            token: getToken(),
          },
        });
      },
    }),
  }),
});

export const { useGetConfigQuery } = configApi;
