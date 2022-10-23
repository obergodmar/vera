import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API = 'http://localhost:3333';

export const api = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: API }),
  reducerPath: 'api',
  endpoints: (builder) => ({}),
});

// TODO: пока пусто
// eslint-disable-next-line no-empty-pattern
export const {} = api;
