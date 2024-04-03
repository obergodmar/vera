import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { IApi, ROUTES } from '@vera-reforged/common';

import { extendFetchArgs } from '../../utils/extendFetchArgs';

const { baseUrl, endpoints } = ROUTES.auth;

export const authApi = createApi({
  baseQuery: fetchBaseQuery({ baseUrl }),
  reducerPath: 'authApi',
  endpoints: (builder) => ({
    [endpoints.authorize]: builder.mutation<
      IApi.IAuthApi.AuthResponse,
      IApi.IAuthApi.AuthRequest
    >({
      query({ data }) {
        return extendFetchArgs<IApi.IAuthApi.AuthRequest>({
          url: endpoints.authorize,
          body: {
            data,
          },
        });
      },
    }),
  }),
});

export const { useAuthorizeMutation } = authApi;
