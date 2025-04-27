import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ICommands } from '@vera-reforged/common';

import { FC } from 'react';

import { RootState } from '../store';
import { Member } from '../types';
import { createAppSelector } from './createAppSelector';
import { currySelector } from './currySelector';

export type CommandComponentProps = {
  id: RollCommandCompositeId;
};

export type CommandType = {
  label: '/roll';
  value: ICommands.CommandsNames;
  description: string;
  Component: FC<CommandComponentProps>;
};

export type SelectionType = 'members' | 'custom';
export type RollCommandState = {
  name?: string;
  phrase: string;
  usersList: Member[];
  selection: SelectionType;
  enabled: boolean;
};

export type RollCommandCompositeId =
  `${ICommands.RollCommand['chatId']}-${ICommands.RollCommand['id']}`;

type State = {
  currentChatId: number | undefined;
  selectedCommand: Record<number, CommandType['value'] | undefined>;
  rollDraft: Map<RollCommandCompositeId, RollCommandState>;
};

const initialRollCommand: RollCommandState = {
  phrase: '',
  selection: 'members',
  usersList: [],
  enabled: true,
};
const initialState: State = {
  currentChatId: undefined,
  selectedCommand: {},
  rollDraft: new Map(),
};

export const commands = createSlice({
  name: 'commands',
  initialState,
  reducers: {
    setCurrentChatId(state, { payload }: PayloadAction<number | undefined>) {
      state.currentChatId = payload;

      if (state.currentChatId) {
        state.rollDraft.set(`${state.currentChatId}-${-1}`, {
          ...initialRollCommand,
        });
      }
    },

    setSelectedCmd(
      state,
      { payload }: PayloadAction<CommandType['value'] | undefined>,
    ) {
      if (!state.currentChatId) {
        return;
      }

      state.selectedCommand[state.currentChatId] = payload;
    },

    setRollState(
      state,
      {
        payload,
      }: PayloadAction<
        Partial<RollCommandState> & { id: RollCommandCompositeId }
      >,
    ) {
      const existingCommand = state.rollDraft.get(payload.id);

      state.rollDraft.set(payload.id, {
        ...initialRollCommand,
        ...existingCommand,
        ...payload,
      });
    },

    resetRollCommandState(
      state,
      { payload }: PayloadAction<RollCommandCompositeId>,
    ) {
      state.rollDraft.delete(payload);
    },
  },
});

export const rollCommandDraftSelector = currySelector(
  createAppSelector(
    [
      (state) => state.commands.rollDraft,
      (_state: RootState, id: RollCommandCompositeId) => id,
    ],
    (rollDraft, id) => rollDraft.get(id) ?? { ...initialRollCommand },
  ),
);

export const {
  setCurrentChatId,
  setSelectedCmd,

  setRollState,
  resetRollCommandState,
} = commands.actions;
