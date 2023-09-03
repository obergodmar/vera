import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IReactions } from '@vera-reforged/common';

type State = {
  currentChatId: number | undefined;
  currentReactions: IReactions.ChatReaction[];
  updatedReactions: IReactions.ChatReaction[];
};

const initialState: State = {
  currentChatId: undefined,
  currentReactions: [],
  updatedReactions: [],
};

export const reactions = createSlice({
  name: 'reactions',
  initialState,
  reducers: {
    setCurrentChatId(state, { payload }: PayloadAction<number | undefined>) {
      state.currentChatId = payload;
    },
  },
});

export const { setCurrentChatId } = reactions.actions;
