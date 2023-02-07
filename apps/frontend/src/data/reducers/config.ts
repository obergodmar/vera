import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Config } from '@vera-reforged/common';

const initialState: Config = {
  duties: {
    chats: [],
    schedulesPerChat: {},
  },
};

export const config = createSlice({
  name: 'config',
  initialState,
  reducers: {
    setConfig: (state, { payload }: PayloadAction<Config>) => {
      state = payload;
    },
  },
});

export const { setConfig } = config.actions;
