import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type State = {
  currentChatId: number | undefined;
  currentCrons: []
  updatedCrons: []
};

const initialState: State = {
  currentChatId: undefined,
  currentCrons: [],
  updatedCrons: [],
};

export const reactions = createSlice({
  name: 'reactions',
  initialState,
  reducers: {
    setCurrentChatId(state, { payload }: PayloadAction<number>) {
      state.currentChatId = payload;
    },
  },
});

export const { setCurrentChatId } = reactions.actions;
