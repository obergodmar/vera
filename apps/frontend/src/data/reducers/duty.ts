import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IDuty } from '@vera-reforged/common';

type State = IDuty.IDuty & {
  currentChatId: number | undefined;
  configSchedule: IDuty.Schedule;
};

const initialState: State = {
  currentChatId: undefined,
  chats: [],
  days: [],
  schedule: {},
  configSchedule: {},
};

export const duty = createSlice({
  name: 'duty',
  initialState,
  reducers: {
    setDutyFromConfig(state, { payload }: PayloadAction<IDuty.IDuty>) {
      if (!Object.keys(state.schedule).length) {
        state = Object.assign(state, payload);
      }

      state.configSchedule = payload.schedule;
    },

    setCurrentChatId(state, { payload }: PayloadAction<number>) {
      state.currentChatId = payload;

      if (typeof state.schedule[payload] === 'undefined') {
        state.schedule[payload] = [];
      }
    },

    resetSchedule(state) {
      state.schedule = state.configSchedule;
    },

    createShift(
      state,
      { payload: { dayNumber } }: PayloadAction<{ dayNumber: number }>
    ) {
      if (!state.currentChatId) {
        throw Error('currentChatId не задан');
      }

      let length = state.schedule[state.currentChatId]?.length;
      if (!length) {
        state.schedule[state.currentChatId] = [];
        length = 0;
      }

      state.schedule[state.currentChatId].push({
        dayNumber,
        tag: '',
        timeTo: '',
        timeFrom: '',
        peerId: length,
        avatar: '',
        firstName: '',
        screenName: '',
        lastName: '',
      });
    },

    editShift(
      state,
      {
        payload: { shift, shiftNumber, dayNumber },
      }: PayloadAction<{
        shift: Partial<IDuty.Duty>;
        shiftNumber: number;
        dayNumber: number;
      }>
    ) {
      if (
        !state.currentChatId ||
        !state.schedule[state.currentChatId]?.length
      ) {
        throw Error(
          'currentChatId не задан или для него отсутствует расписание'
        );
      }

      const currentSchedule = state.schedule[state.currentChatId];
      const shiftIndex = findScheduleShiftIndex(
        currentSchedule,
        dayNumber,
        shiftNumber
      );

      currentSchedule[shiftIndex] = Object.assign(
        currentSchedule[shiftIndex],
        shift
      );
    },

    removeShift(
      state,
      {
        payload: { shiftNumber, dayNumber },
      }: PayloadAction<{
        dayNumber: number;
        shiftNumber: number;
      }>
    ) {
      if (!state.currentChatId) {
        throw Error('currentChatId не задан');
      }

      const currentSchedule = state.schedule[state.currentChatId];
      const shiftIndex = findScheduleShiftIndex(
        currentSchedule,
        dayNumber,
        shiftNumber
      );

      currentSchedule.splice(shiftIndex, 1);
    },
  },
});

export const {
  setDutyFromConfig,
  setCurrentChatId,
  resetSchedule,
  createShift,
  editShift,
  removeShift,
} = duty.actions;

function findScheduleShiftIndex(
  schedule: IDuty.Duty[],
  dayNumber: number,
  shiftNumber: number
): number {
  const shiftsIndexes = schedule.reduce((acc: number[], duty, index) => {
    if (duty.dayNumber === dayNumber) {
      acc.push(index);
    }

    return acc;
  }, []);

  const shiftIndex = shiftsIndexes[shiftNumber];

  if (shiftIndex === undefined) {
    throw Error('Индекс смены не найден');
  }

  return shiftIndex;
}
