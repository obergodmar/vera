import { ICommands } from '@vera-reforged/common';
import { Icon24ErrorCircle } from '@vkontakte/icons';
import { Spinner } from '@vkontakte/vkui';

import { FC, useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  resetRollCommandState,
  RollCommandCompositeId,
  rollCommandDraftSelector,
  setRollState,
} from '../../data/reducers/commands';
import {
  useDeleteRollCommandForChatMutation,
  useUpdateRollCommandForChatMutation,
} from '../../data/services/commands-api';
import { useGetMembersForChatQuery } from '../../data/services/convo-api';
import { useConfirmation } from '../../hooks/useConfirmation';
import { useSnackbar } from '../../hooks/useSnackbar';
import { ModifiableCell } from '../modifiable-cell';
import { CommandPicker } from './command-picker';
import { parseSelectionToMembersIds } from './parseSelectionToMembersIds';

type Props = {
  chatId: number;
  idx: number;
  existingCommand: ICommands.ChatCommand;
};

export const Command: FC<Props> = ({ chatId, idx, existingCommand }) => {
  const dispatch = useDispatch();
  const snackbar = useSnackbar();

  const { confirmed, setConfirmed, confirmationTimer } = useConfirmation(5);
  const { data: members = [], isFetching: isMembersListFetching } =
    useGetMembersForChatQuery(chatId);

  const commandId: RollCommandCompositeId = `${chatId}-${existingCommand.command.id}`;
  const existingUsersLists = useMemo(() => {
    const { membersIds } = existingCommand.command;
    if (membersIds === '') {
      return members;
    }

    const membersIdsArray = membersIds.split(',');
    return members.filter(
      ({ value }) =>
        !!membersIdsArray.find((id) => String(id) === String(value)),
    );
  }, [existingCommand.command, members]);

  const resetRollState = useCallback(() => {
    const {
      nameExtra,
      command: { membersIds, phrase },
      enabled,
    } = existingCommand;

    dispatch(
      setRollState({
        id: commandId,
        phrase,
        name: nameExtra,
        selection: membersIds === '' ? 'members' : 'custom',
        usersList: existingUsersLists,
        enabled,
      }),
    );
  }, [commandId, dispatch, existingCommand, existingUsersLists]);

  useEffect(() => {
    if (isMembersListFetching) {
      return;
    }
    resetRollState();
  }, [resetRollState, isMembersListFetching]);

  const [
    submitUpdate,
    { data: updateData, isLoading: updateIsLoading, reset: resetUpdate },
  ] = useUpdateRollCommandForChatMutation();

  useEffect(() => {
    if (updateData?.success) {
      snackbar({
        message: 'Команда создана',
        before: <Icon24ErrorCircle fill="var(--vkui--color_icon_accent)" />,
      });

      dispatch(resetRollCommandState(commandId));
    }
  }, [updateData, dispatch, commandId, snackbar]);

  const [
    submitDelete,
    { data: deleteData, isLoading: deleteIsLoading, reset: resetDelete },
  ] = useDeleteRollCommandForChatMutation();

  useEffect(() => {
    if (deleteData?.success) {
      snackbar({
        message: 'Команда удалена',
        before: <Icon24ErrorCircle fill="var(--vkui--color_icon_accent)" />,
      });

      dispatch(resetRollCommandState(commandId));
    }
  }, [deleteData, dispatch, commandId, snackbar]);

  useEffect(() => {
    resetUpdate();
    resetDelete();
  });

  const { name, phrase, selection, usersList, enabled } = useSelector(
    rollCommandDraftSelector(commandId),
  );

  const membersIds = parseSelectionToMembersIds(selection, usersList);
  const modified =
    enabled !== existingCommand.enabled ||
    phrase !== existingCommand.command.phrase ||
    !isSameMemberIdsList(membersIds, existingCommand.command.membersIds) ||
    name !== existingCommand.nameExtra;

  if (isMembersListFetching) {
    return <Spinner />;
  }

  const membersEnough = selection === 'members' || usersList.length >= 2;

  return (
    <ModifiableCell
      modified={modified}
      overTitle={`Команда №${idx + 1}`}
      enabled={enabled}
      setEnabled={() => {
        dispatch(
          setRollState({
            id: commandId,
            enabled: !enabled,
          }),
        );
      }}
      onSave={() => {
        submitUpdate({
          id: existingCommand.command.id,
          chatId,
          phrase,
          membersIds,
          enabled,
          name,
        });
      }}
      onReset={resetRollState}
      onRemove={() => {
        if (confirmed) {
          submitDelete({
            id: existingCommand.command.id,
            chatId,
          });
        }

        setConfirmed(true);
      }}
      removeConfirmed={confirmed}
      confirmationTimer={confirmationTimer}
      isLoading={updateIsLoading || deleteIsLoading}
      error={
        !membersEnough
          ? 'Список должен быть минимум из двух человек'
          : undefined
      }
    >
      <CommandPicker
        command={existingCommand.name}
        commandId={commandId}
        commandSelectDisabled
        members={members}
      />
    </ModifiableCell>
  );
};

function isSameMemberIdsList(a: string, b: string): boolean {
  const arrA = a.split(',');
  const arrB = b.split(',');

  if (arrA.length !== arrB.length) {
    return false;
  }

  const setA = new Set(arrA);
  const setB = new Set(arrB);

  if (setA.size !== setB.size) {
    return false;
  }

  for (const val of setA) {
    if (!setB.has(val)) {
      return false;
    }
  }

  return true;
}
