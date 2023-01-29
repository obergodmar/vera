import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Config } from '@vera-reforged/common';

import { getToken } from '../../utils/getToken';

export const loginApi = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  reducerPath: 'login',
  endpoints: (builder) => ({
    authorize: builder.mutation<
      { config?: Config; token?: string; error?: string },
      string
    >({
      query(password) {
        return {
          method: 'POST',
          url: '/login',
          headers: {
            'Content-Type': 'application/json',
          },
          body: {
            password,
          },
        };
      },
    }),
    getConfig: builder.query<Config, void>({
      query(token) {
        return {
          url: '/getConfig',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: {
            token: getToken(),
          },
        };
      },
    }),
  }),
});

export const { useAuthorizeMutation, useGetConfigQuery } = loginApi;
