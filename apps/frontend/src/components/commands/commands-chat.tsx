import { Icon24ErrorCircle } from '@vkontakte/icons';
import { Button, FormItem, Spinner } from '@vkontakte/vkui';

import { FC, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  resetRollCommandState,
  RollCommandCompositeId,
  rollCommandDraftSelector,
  setSelectedCmd,
} from '../../data/reducers/commands';
import { useCreateRollCommandForChatMutation } from '../../data/services/commands-api';
import { useGetMembersForChatQuery } from '../../data/services/convo-api';
import { RootState } from '../../data/store';
import { useSnackbar } from '../../hooks/useSnackbar';
import { CommandPicker } from './command-picker';
import { parseSelectionToMembersIds } from './parseSelectionToMembersIds';

type Props = { chatId: number };

export const CommandChat: FC<Props> = ({ chatId }) => {
  const dispatch = useDispatch();
  const snackbar = useSnackbar();
  const selectedCmd = useSelector(
    (state: RootState) => state.commands.selectedCommand[chatId],
  );

  const commandId: RollCommandCompositeId = `${chatId}-${-1}`;
  const { phrase, name, selection, usersList, enabled } = useSelector(
    rollCommandDraftSelector(commandId),
  );

  const { data: members = [], isFetching: isMembersListFetching } =
    useGetMembersForChatQuery(chatId);

  const [submit, { data, isLoading, reset }] =
    useCreateRollCommandForChatMutation();

  useEffect(() => {
    if (!data?.success) {
      return;
    }

    snackbar({
      message: 'Команда создана',
      before: <Icon24ErrorCircle fill="var(--vkui--color_icon_accent)" />,
    });

    dispatch(resetRollCommandState(commandId));
    dispatch(setSelectedCmd(undefined));
  }, [data, dispatch, commandId, snackbar]);

  useEffect(() => reset);

  if (isMembersListFetching) {
    return <Spinner />;
  }

  const membersEnough = selection === 'members' || usersList.length >= 2;
  const isValid = phrase && membersEnough;

  return (
    <>
      <CommandPicker
        command={selectedCmd}
        commandId={commandId}
        members={members}
      />

      <FormItem
        status={!membersEnough ? 'error' : 'default'}
        bottom={
          !membersEnough ? 'Список должен быть минимум из двух человек' : ''
        }
      >
        <Button
          stretched
          disabled={!isValid}
          loading={isLoading}
          onClick={() => {
            submit({
              phrase,
              chatId,
              membersIds: parseSelectionToMembersIds(selection, usersList),
              name,
              enabled,
            });
          }}
        >
          Создать команду
        </Button>
      </FormItem>
    </>
  );
};
