import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { getToken } from '../../utils/getToken';

type Authorization = {
  authorized: boolean;
};

const initialState: Authorization = {
  authorized: !!getToken(),
};

export const authorization = createSlice({
  name: 'authorization',
  initialState,
  reducers: {
    authorize: (
      state,
      { payload: { token } }: PayloadAction<{ token: string }>,
    ) => {
      window.localStorage.setItem('token', token);

      return {
        authorized: true,
      };
    },
    logOff: (state) => {
      window.localStorage.removeItem('token');

      return {
        authorized: false,
      };
    },
  },
});

export const { authorize, logOff } = authorization.actions;
