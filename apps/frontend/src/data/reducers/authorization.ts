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
      window.localStorage.setItem('config', config);

      return {
        authorized: true,
        config,
      };
    },
    logOff: () => {
      window.localStorage.removeItem('token');
      window.localStorage.removeItem('config');

      return initialState;
    },

    updateConfig: (state, { payload }: PayloadAction<Config>) => {
      window.localStorage.setItem('config', payload);

      state.config = payload;
    },
  },
});

export const { authorize, logOff, updateConfig } = authorization.actions;
