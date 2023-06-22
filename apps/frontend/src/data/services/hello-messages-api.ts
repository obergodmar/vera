import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/dist/query/react';
import { ROUTES } from '@vera-reforged/common';

export const helloMessagesApi = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: ROUTES }),
});
