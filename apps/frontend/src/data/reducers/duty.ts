import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IDuty } from '@vera-reforged/common';

type State = IDuty.IDuty & {
  currentChatId: number | undefined;
};

const initialState: State = {
  currentChatId: undefined,
  chats: [],
  days: [],
  schedule: {},
};

export const duty = createSlice({
  name: 'duty',
  initialState,
  reducers: {
    setDutyFromConfig(state, { payload }: PayloadAction<IDuty.IDuty>) {
      Object.assign(state, payload);
    },

    setCurrentChatId(state, { payload }: PayloadAction<number>) {
      state.currentChatId = payload;

      if (typeof state.schedule[payload] === 'undefined') {
        state.schedule[payload] = [];
      }
    },

    setDuties(state, { payload }: PayloadAction<IDuty.Duty[]>) {
      if (!state.currentChatId || state.schedule[state.currentChatId]) {
        throw Error(
          'currentChatId не задан или для него отсутствует расписание'
        );
      }

      state.schedule[state.currentChatId] = payload;
    },
  },
});

export const { setDutyFromConfig, setCurrentChatId, setDuties } = duty.actions;
