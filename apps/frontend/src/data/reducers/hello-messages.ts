import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IHelloMessages } from '@vera-reforged/common';

type State = {
  currentChatId: number | undefined;
  currentMessages: IHelloMessages.MessagePerChat[];
  updatedMessages: IHelloMessages.MessagePerChat[];
};

const initialState: State = {
  currentChatId: undefined,
  currentMessages: [],
  updatedMessages: [],
};

export const helloMessages = createSlice({
  name: 'helloMessages',
  initialState,
  reducers: {
    setCurrentChatId(state, { payload }: PayloadAction<number | undefined>) {
      state.currentChatId = payload;
    },

    setCurrentMessages(
      state,
      { payload }: PayloadAction<IHelloMessages.MessagePerChat[]>,
    ) {
      state.currentMessages = payload;
      state.updatedMessages = payload;
    },

    updateMessage(
      state,
      {
        payload: { chatId, message },
      }: PayloadAction<IHelloMessages.MessagePerChat>,
    ) {
      const index = state.updatedMessages.findIndex(
        ({ chatId: id }) => id === chatId,
      );
      if (index !== -1) {
        state.updatedMessages[index] = { chatId, message };
      } else {
        state.updatedMessages.push({ chatId, message });
      }
    },

    resetHelloMessages(state) {
      state.updatedMessages = state.currentMessages;
    },
  },
});

export const {
  setCurrentMessages,
  setCurrentChatId,
  updateMessage,
  resetHelloMessages,
} = helloMessages.actions;
