import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { getToken } from '../../utils/getToken';

type Authorization = boolean;

const initialState: Authorization = !!getToken();

export const authorization = createSlice({
  name: 'authorization',
  initialState,
  reducers: {
    authorize: (state, { payload }: PayloadAction<string>) => {
      window.localStorage.setItem('token', payload);

      return true;
    },
    logOff: () => {
      window.localStorage.removeItem('token');

      return false;
    },
  },
});

export const { authorize, logOff } = authorization.actions;
