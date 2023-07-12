import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IHelloMessages } from '@vera-reforged/common';

type State = {
  currentChatId: number | undefined;
  currentMessages: IHelloMessages.MessagePerChats[];
  updatedMessages: IHelloMessages.MessagePerChats[];
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
    setCurrentChatId(state, { payload }: PayloadAction<number>) {
      state.currentChatId = payload;
    },

    setCurrentMessages(
      state,
      { payload }: PayloadAction<IHelloMessages.MessagePerChats[]>
    ) {
      state.currentMessages = payload;
      state.updatedMessages = payload;
    },

    updateMessage(
      state,
      {
        payload: { chatId, message },
      }: PayloadAction<IHelloMessages.MessagePerChats>
    ) {
      const index = state.updatedMessages.findIndex(
        ({ chatId: id }) => id === chatId
      );
      if (index !== -1) {
        state.updatedMessages[index] = { chatId, message };
      } else {
        state.updatedMessages.push({ chatId, message });
      }
    },
  },
});

export const { setCurrentMessages, setCurrentChatId, updateMessage } =
  helloMessages.actions;
