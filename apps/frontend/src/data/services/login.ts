import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const loginApi = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  reducerPath: 'loginApi',
  endpoints: (builder) => ({
    authorize: builder.mutation<{ token?: string; error?: string }, string>({
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
  }),
});

export const { useAuthorizeMutation } = loginApi;
