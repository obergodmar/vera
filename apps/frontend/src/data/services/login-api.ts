import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ROUTES } from '@vera-reforged/common';

const { baseUrl, endpoints } = ROUTES.login;

export const loginApi = createApi({
  baseQuery: fetchBaseQuery({ baseUrl }),
  reducerPath: 'loginApi',
  endpoints: (builder) => ({
    [endpoints.login]: builder.mutation<
      { token?: string; error?: string },
      string
    >({
      query(password) {
        return {
          method: 'POST',
          url: endpoints.login,
          headers: {
            'Content-Type': 'application/json',
          },
          body: {
            password,
          },
        };
      },
    }),
  }),
});

export const { useLoginMutation } = loginApi;
