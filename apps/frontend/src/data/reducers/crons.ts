import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type State = {
  currentChatId: number | undefined;
  currentCrons: [];
  updatedCrons: [];
};

const initialState: State = {
  currentChatId: undefined,
  currentCrons: [],
  updatedCrons: [],
};

export const crons = createSlice({
  name: 'crons',
  initialState,
  reducers: {
    setCurrentChatId(state, { payload }: PayloadAction<number | undefined>) {
      state.currentChatId = payload;
    },
  },
});

export const { setCurrentChatId } = crons.actions;
