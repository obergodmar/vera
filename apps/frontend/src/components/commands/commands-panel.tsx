import { Icon24ErrorCircle } from '@vkontakte/icons';
import { Group, Header, PanelSpinner } from '@vkontakte/vkui';

import { FC, Fragment, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { setCurrentChatId } from '../../data/reducers/commands';
import {
  useDisableAllCommandsMutation,
  useDisableCommandsForChatMutation,
  useGetCommandsChatsQuery,
  useGetCommandsForChatQuery,
} from '../../data/services/commands-api';
import { useGetChatsQuery } from '../../data/services/convo-api';
import { RootState } from '../../data/store';
import { useSnackbar } from '../../hooks/useSnackbar';
import { ConfirmationCell } from '../confirmation-cell';
import { ConvoSearch } from '../convo-search';
import { FilterGroup } from '../filter-group';
import { ScrollToTop } from '../scroll-to-top';
import { Command } from './command';
import { CommandChat } from './commands-chat';

export const CommandsPanel: FC = () => {
  const snackbar = useSnackbar();

  const dispatch = useDispatch();
  const [enabledFilter, setEnabledFilter] = useState(true);
  const [disabledFilter, setDisabledFilter] = useState(true);

  const {
    isLoading: isChatsLoading,
    data: chats = [],
    refetch: refetchChats,
  } = useGetChatsQuery();

  const { isLoading: isCommandsChatLoading, data: commandsChats } =
    useGetCommandsChatsQuery({});

  const chatId = useSelector(
    (state: RootState) => state.commands.currentChatId,
  );
  const selectedChat = useMemo(
    () => chats.find(({ value }) => value === chatId),
    [chatId, chats],
  );

  const { data: commands, refetch: refetchCommands } =
    useGetCommandsForChatQuery({ chatId }, { skip: !chatId });

  const [
    disableAllCommands,
    {
      isLoading: isDisableAllLoading,
      data: disableAllStatus,
      reset: resetDisableAll,
    },
  ] = useDisableAllCommandsMutation();

  const [
    disableCommandsForChat,
    {
      isLoading: isDisableForChatLoading,
      data: disableForChatData,
      reset: resetDisableForChat,
    },
  ] = useDisableCommandsForChatMutation();

  useEffect(
    () => () => {
      resetDisableAll();
      resetDisableForChat();
    },
    [resetDisableAll, resetDisableForChat],
  );

  useEffect(() => {
    if (disableAllStatus?.success) {
      const { count } = disableAllStatus;

      snackbar({
        message: `Команд во всех чатах выключено: ${count || 0}`,
        before: <Icon24ErrorCircle fill="var(--vkui--color_icon_accent)" />,
      });

      resetDisableAll();
    }
  }, [disableAllStatus, resetDisableAll, snackbar]);

  useEffect(() => {
    if (disableForChatData?.success) {
      const { count } = disableForChatData;

      snackbar({
        message: `Команд для выбранного чата выключено: ${count || 0}`,
        before: <Icon24ErrorCircle fill="var(--vkui--color_icon_accent)" />,
      });

      resetDisableForChat();
    }
  }, [disableForChatData, resetDisableForChat, snackbar]);

  if (isChatsLoading || isCommandsChatLoading) {
    return <PanelSpinner>Команды загружаются</PanelSpinner>;
  }

  return (
    <>
      <Group>
        <Group
          mode="plain"
          description="Команды Веры - это как реакции, только с заданной логикой и динамикой в ответе"
        >
          <Header>Команды</Header>
        </Group>
        <Group mode="plain">
          <ConfirmationCell
            onProceed={() => disableAllCommands({})}
            title="Выключить все команды (во всех чатах)"
            isSucceeded={!!disableAllStatus?.success}
            disabled={isDisableAllLoading}
          />
        </Group>

        <Group mode="plain">
          <Header>Установка команды в чат</Header>
          <ConvoSearch
            value={chatId}
            convos={chats}
            updatedConvosIds={commandsChats?.items}
            onChange={(id) => dispatch(setCurrentChatId(id))}
            refetchConvos={refetchChats}
            disableUpdatedConvosSwitch={false}
          />
        </Group>
      </Group>

      {!!chatId && selectedChat && (
        <Group title="Новая команда">
          <CommandChat chatId={chatId} />
        </Group>
      )}

      {!!chatId && selectedChat && (
        <Group>
          <ConfirmationCell
            onProceed={() => disableCommandsForChat({ chatId })}
            title={`Выключить все команды для этого чата (${
              commands?.count || 0
            })`}
            isSucceeded={!!disableForChatData?.success}
            disabled={!commands?.count || isDisableForChatLoading}
          />

          <FilterGroup
            refetch={refetchCommands}
            refetchText="Обновить список команд"
            enabledChecked={enabledFilter}
            enabledChanged={setEnabledFilter}
            disabledChecked={disabledFilter}
            disabledChanged={setDisabledFilter}
            title={`Созданные команды (${commands?.count || 0}) для чата "${
              selectedChat.label
            }"`}
          />
        </Group>
      )}

      {commands?.items.map((chatCommand, idx) => (
        <Fragment key={chatCommand.command.id}>
          {enabledFilter && chatCommand.enabled && (
            <Group>
              <Command
                idx={idx}
                chatId={chatCommand.command.chatId}
                existingCommand={chatCommand}
              />
            </Group>
          )}

          {disabledFilter && !chatCommand.enabled && (
            <Group>
              <Command
                idx={idx}
                chatId={chatCommand.command.chatId}
                existingCommand={chatCommand}
              />
            </Group>
          )}
        </Fragment>
      ))}

      <ScrollToTop />
    </>
  );
};
