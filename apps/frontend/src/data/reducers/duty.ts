import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IDuty } from '@vera-reforged/common';

import { Member } from '../services/duty-api';

type State = IDuty.IDuty & {
  currentChatId: number | undefined;
  initialSchedule: IDuty.Schedule;
};

const initialState: State = {
  currentChatId: undefined,
  chats: [],
  days: [],
  schedule: {},
  initialSchedule: {},
};

export const duty = createSlice({
  name: 'duty',
  initialState,
  reducers: {
    setDutyFromConfig(state, { payload }: PayloadAction<IDuty.IDuty>) {
      state = Object.assign(state, payload);

      state.initialSchedule = payload.schedule;
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

    createShift(
      state,
      {
        payload: { member, dayNumber },
      }: PayloadAction<{ member: Member; dayNumber: number }>
    ) {
      if (!state.currentChatId || state.schedule[state.currentChatId]) {
        throw Error(
          'currentChatId не задан или для него отсутствует расписание'
        );
      }

      const { peerId, firstName, lastName, avatar, screenName } = member;

      state.schedule[state.currentChatId].push({
        peerId,
        firstName,
        lastName,
        screenName,
        avatar,
        dayNumber,
        tag: '',
        timeTo: '00:01',
        timeFrom: '23:59',
      });
    },

    editShift(
      state,
      {
        payload: { shift, shiftNumber },
      }: PayloadAction<{ shift: Partial<IDuty.Duty>; shiftNumber: number }>
    ) {
      if (!state.currentChatId || state.schedule[state.currentChatId]) {
        throw Error(
          'currentChatId не задан или для него отсутствует расписание'
        );
      }

      const currentShift = state.schedule[state.currentChatId][shiftNumber];

      if (!currentShift) {
        throw Error('Невозможно отредактировать несозданную смену');
      }

      state.schedule[state.currentChatId][shiftNumber] = Object.assign(
        currentShift,
        shift
      );
    },
  },
});

export const {
  setDutyFromConfig,
  setCurrentChatId,
  setDuties,
  createShift,
  editShift,
} = duty.actions;
