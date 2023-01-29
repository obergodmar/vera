import { ResponseHandler } from '@reduxjs/toolkit/dist/query/fetchBaseQuery';

import { getToken } from './getToken';

type ExtendFetchArgs = {
  url: string;
  body?: any;
  responseHandler?: ResponseHandler;
};

export function extendFetchArgs({
  body: extendedBody = {},
  ...rest
}: ExtendFetchArgs) {
  const body = {
    token: getToken(),
    ...extendedBody,
  };

  return {
    ...rest,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body,
  };
}
