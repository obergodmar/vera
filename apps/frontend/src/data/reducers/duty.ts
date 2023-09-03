import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IDuty } from '@vera-reforged/common';

type State = {
  currentChatId: number | undefined;
  currentSchedule: IDuty.Schedule[];
  schedule: Record<number, IDuty.Schedule[]>;
};

const initialState: State = {
  currentChatId: undefined,
  currentSchedule: [],
  schedule: {},
};

export const duty = createSlice({
  name: 'duty',
  initialState,
  reducers: {
    setCurrentChatId(state, { payload }: PayloadAction<number | undefined>) {
      state.currentChatId = payload;
    },

    setCurrentSchedule(state, { payload }: PayloadAction<IDuty.Schedule[]>) {
      if (!state.currentChatId) {
        throw Error('currentChatId не задан');
      }

      state.currentSchedule = payload;
      state.schedule[state.currentChatId] = payload;
    },

    resetSchedule(state) {
      if (!state.currentChatId) {
        throw Error('currentChatId не задан');
      }

      state.schedule[state.currentChatId] = state.currentSchedule;
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
        chatId: state.currentChatId,
        dayNumber,
        tag: '',
        timeTo: '23:59',
        timeFrom: '00:00',
        userId: length,
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
        shift: Partial<IDuty.Schedule>;
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

      if ('tag' in shift) {
        shift.tag = shift.tag?.replace('#', '');
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
  setCurrentChatId,
  setCurrentSchedule,
  resetSchedule,
  createShift,
  editShift,
  removeShift,
} = duty.actions;

function findScheduleShiftIndex(
  schedule: IDuty.Schedule[],
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
