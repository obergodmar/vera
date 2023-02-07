import { createSlice } from '@reduxjs/toolkit';
import { SchedulePerChatWithDays } from '@vera-reforged/common';

type DutiesPerChat = Record<number, SchedulePerChatWithDays> & {
  current: number | undefined;
};

const initialState: DutiesPerChat = {
  current: undefined,
};

export const duties = createSlice({
  name: 'duties',
  initialState,
  reducers: {},
});

export const {} = duties.actions;
