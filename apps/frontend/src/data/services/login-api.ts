import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ROUTES } from '@vera-reforged/common';

export const loginApi = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: ROUTES.login.baseUrl }),
  reducerPath: 'loginApi',
  endpoints: (builder) => ({
    authorize: builder.mutation<{ token?: string; error?: string }, string>({
      query(password) {
        return {
          method: 'POST',
          url: ROUTES.login.url,
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

export const { useAuthorizeMutation } = loginApi;
