import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Config } from '@vera-reforged/common';

import { getToken } from '../../utils/getToken';

type Authorization = {
  authorized: boolean;
  config: Config | null;
};

const initialState: Authorization = {
  authorized: !!getToken(),
  config: null,
};

export const authorization = createSlice({
  name: 'authorization',
  initialState,
  reducers: {
    authorize: (
      state,
      {
        payload: { token, config },
      }: PayloadAction<{ token: string; config: Config }>
    ) => {
      window.localStorage.setItem('token', token);

      return {
        authorized: true,
        config,
      };
    },
    logOff: (state) => {
      window.localStorage.removeItem('token');

      return {
        authorized: false,
        config: null,
      };
    },

    updateConfig: (state, { payload }: PayloadAction<Config>) => {
      state.config = payload;
    },
  },
});

export const { authorize, logOff, updateConfig } = authorization.actions;
