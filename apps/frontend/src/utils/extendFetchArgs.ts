import { ResponseHandler } from '@reduxjs/toolkit/dist/query/fetchBaseQuery';

import { getToken } from './getToken';

type ExtendFetchArgs<Request> = {
  url: string;
  body: Omit<Request, 'token'>;
  responseHandler?: ResponseHandler;
};

export function extendFetchArgs<Request>({
  body: extendedBody,
  ...rest
}: ExtendFetchArgs<Request>) {
  let token = getToken();
  if (!token) {
    token = '';
  }

  const body = {
    ...extendedBody,
    token,
  };

  return {
    ...rest,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    body: body as any,
  };
}
