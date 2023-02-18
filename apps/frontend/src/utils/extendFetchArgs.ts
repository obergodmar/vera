import { ResponseHandler } from '@reduxjs/toolkit/dist/query/fetchBaseQuery';
import { IApi } from '@vera-reforged/common';

import { getToken } from './getToken';

type ExtendFetchArgs<Request extends IApi.IDutyApi.Requests> = {
  url: string;
  body: Omit<Request, 'token'>;
  responseHandler?: ResponseHandler;
};

export function extendFetchArgs<Request extends IApi.IDutyApi.Requests>({
  body: extendedBody,
  ...rest
}: ExtendFetchArgs<Request>) {
  let token = getToken();
  if (!token) {
    token = '';
  }

  const body: IApi.IDutyApi.Requests = {
    ...extendedBody,
    token,
  };

  return {
    ...rest,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: body as any,
  };
}
