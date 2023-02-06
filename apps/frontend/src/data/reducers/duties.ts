import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Day, Duties, DutyChip } from '@vera-reforged/common';

import { WritableDraft } from 'immer/dist/types/types-external';

type DutiesPerChat = Record<number, Duties> & {
  current: number | undefined;
};

const initialState: DutiesPerChat = {
  current: undefined,
};
export const initialDays: Day[] = [
  {
    name: 'пн',
    fullName: 'понедельник',
    value: 1,
    checked: true,
  },
  {
    name: 'вт',
    fullName: 'вторник',
    value: 2,
    checked: true,
  },
  {
    name: 'ср',
    fullName: 'среда',
    value: 3,
    checked: true,
  },
  {
    name: 'чт',
    fullName: 'четверг',
    value: 4,
    checked: true,
  },
  {
    name: 'пт',
    fullName: 'пятница',
    value: 5,
    checked: true,
  },
];

export const initialDuties: Duties = {
  duties: [],
  days: initialDays,
};

export const duties = createSlice({
  name: 'duties',
  initialState,
  reducers: {
    setPeerId: (state, { payload }: PayloadAction<number>) => {
      if (!state[payload]) {
        state[payload] = { ...initialDuties };
      }

      state.current = payload;
    },
    setDuties: (
      state,
      {
        payload: { duties, peerId },
      }: PayloadAction<{ duties: DutyChip[]; peerId: number }>
    ) => {
      if (!state[peerId]) {
        state[peerId] = { ...initialDuties };
      }

      state[peerId].duties = duties;
    },
    dragDuties: (
      state,
      {
        payload: { from, to, peerId },
      }: PayloadAction<{ from: number; to: number; peerId: number }>
    ) => {
      const duty = state[peerId].duties[from];
      state[peerId].duties.splice(from, 1);
      state[peerId].duties.splice(to, 0, duty);
    },
    removeDuty: (
      state,
      {
        payload: { idx, peerId },
      }: PayloadAction<{ idx: number; peerId: number }>
    ) => {
      state[peerId].duties.splice(idx, 1);
    },
    setDays: (
      state,
      {
        payload: { days, peerId },
      }: PayloadAction<{ days: Day[]; peerId: number }>
    ) => {
      if (!state[peerId]) {
        state[peerId] = { ...initialDuties };
      }

      state[peerId].days = days;
    },
    setTime: (
      state,
      {
        payload: { peerId, idx, value },
      }: PayloadAction<{ peerId: number; idx: number; value: string }>
    ) => {
      state[peerId].days[idx].time = value;
    },
    sortDays: (
      state,
      {
        payload: { checked, idx, peerId },
      }: PayloadAction<{ checked: boolean; idx: number; peerId: number }>
    ) => {
      const day = state[peerId].days[idx];
      day.checked = checked;

      if (!day.checked) {
        state[peerId].days.splice(idx, 1);
      }

      sortDaysFn(state[peerId].days);

      if (!day.checked) {
        state[peerId].days.push(day);
      }

      if (!state[peerId].days.some(({ checked }) => checked)) {
        sortDaysFn(state[peerId].days);
      }
    },
  },
});

export const {
  setDuties,
  removeDuty,
  dragDuties,
  sortDays,
  setPeerId,
  setDays,
  setTime,
} = duties.actions;

function sortDaysFn(days: WritableDraft<Day[]>) {
  days.sort((a, b) => {
    if ((a.checked && b.checked) || (!a.checked && !b.checked)) {
      return a.value - b.value;
    }

    if (!a.checked && b.checked) {
      return 1;
    }

    if (a.checked && !b.checked) {
      return -1;
    }

    return 0;
  });
}
