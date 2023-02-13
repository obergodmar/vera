import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IConfig } from '@vera-reforged/common';

const initialState: IConfig.IConfig = {
  duty: {
    chats: [],
    days: [],
    schedule: [],
  },
};

export const config = createSlice({
  name: 'config',
  initialState,
  reducers: {
    setConfig: (state, { payload }: PayloadAction<IConfig.IConfig>) => {
      state = payload;
    },
  },
});

export const { setConfig } = config.actions;
