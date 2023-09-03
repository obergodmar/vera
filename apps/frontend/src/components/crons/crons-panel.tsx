import { Icon24ErrorCircle } from '@vkontakte/icons';
import { Group, Header, PanelSpinner } from '@vkontakte/vkui';

import { FC, Fragment, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { setCurrentChatId } from '../../data/reducers/crons';
import { useGetChatsQuery } from '../../data/services/convo-api';
import {
  useDisableAllCronsMutation,
  useDisableCronsForChatMutation,
  useGetCronsChatsQuery,
  useGetCronsForChatQuery,
} from '../../data/services/crons-api';
import { RootState } from '../../data/store';
import { useSnackbar } from '../../hooks/useSnackbar';
import { ConfirmationCell } from '../confirmation-cell';
import { ConvoSearch } from '../convo-search';
import { FilterGroup } from '../filter-group';
import { ScrollToTop } from '../scroll-to-top';
import { Cron } from './cron';
import { CronsChat } from './crons-chat';

export const CronsPanel: FC = () => {
  const snackbar = useSnackbar();

  const dispatch = useDispatch();
  const [enabledFilter, setEnabledFilter] = useState(true);
  const [disabledFilter, setDisabledFilter] = useState(true);

  const {
    isLoading: isChatsLoading,
    data: chats = [],
    refetch: refetchChats,
  } = useGetChatsQuery();

  const { isLoading: isCronsChatsLoading, data: cronsChats } =
    useGetCronsChatsQuery({});

  const chatId = useSelector((state: RootState) => state.crons.currentChatId);
  const selectedChat = useMemo(
    () => chats.find(({ value }) => value === chatId),
    [chatId, chats]
  );

  const { data: crons, refetch: refetchCrons } = useGetCronsForChatQuery(
    { chatId },
    { skip: !chatId }
  );

  const [
    disableAllCrons,
    {
      isLoading: isDisableAllLoading,
      data: disableAllStatus,
      reset: resetDisableAll,
    },
  ] = useDisableAllCronsMutation();

  const [
    disableCronsForChat,
    {
      isLoading: isDisableForChatLoading,
      data: disableForChatData,
      reset: resetDisableForChat,
    },
  ] = useDisableCronsForChatMutation();

  useEffect(
    () => () => {
      resetDisableAll();
      resetDisableForChat();
    },
    [resetDisableAll, resetDisableForChat]
  );

  useEffect(() => {
    if (disableAllStatus?.success) {
      const { count } = disableAllStatus;

      snackbar({
        message: `Кронов во всех чатах выключено: ${count || 0}`,
        before: <Icon24ErrorCircle fill="var(--vkui--color_icon_accent)" />,
      });

      resetDisableAll();
    }
  }, [disableAllStatus, resetDisableAll, snackbar]);

  useEffect(() => {
    if (disableForChatData?.success) {
      const { count } = disableForChatData;

      snackbar({
        message: `Кронов для выбранного чата выключено: ${count || 0}`,
        before: <Icon24ErrorCircle fill="var(--vkui--color_icon_accent)" />,
      });

      resetDisableForChat();
    }
  }, [disableForChatData, resetDisableForChat, snackbar]);

  if (isChatsLoading || isCronsChatsLoading) {
    return <PanelSpinner>Кроны загружаются</PanelSpinner>;
  }

  return (
    <>
      <Group>
        <Group
          mode="plain"
          description="Кроны Веры - это повторяемые сообщения, отправляемые Верой в определенные дни и в определенное время"
        >
          <Header>Кроны</Header>
        </Group>
        <Group mode="plain">
          <ConfirmationCell
            onProceed={() => disableAllCrons({})}
            title="Выключить все кроны (во всех чатах)"
            isSucceeded={!!disableAllStatus?.success}
            disabled={isDisableAllLoading}
          />
        </Group>

        <Group mode="plain">
          <Header>Установка крона в чат</Header>
          <ConvoSearch
            value={chatId}
            convos={chats}
            updatedConvosIds={cronsChats?.items}
            onChange={(id) => dispatch(setCurrentChatId(id))}
            refetchConvos={refetchChats}
          />

          {!!chatId && selectedChat && (
            <>
              <Group mode="plain" />
              <CronsChat chatTitle={selectedChat.label} chatId={chatId} />
            </>
          )}
        </Group>
      </Group>

      {!!chatId && selectedChat && (
        <Group>
          <ConfirmationCell
            onProceed={() => disableCronsForChat({ chatId })}
            title={`Выключить все кроны для этого чата (${crons?.count || 0})`}
            isSucceeded={!!disableForChatData?.success}
            disabled={!crons?.count || isDisableForChatLoading}
          />

          <FilterGroup
            refetch={refetchCrons}
            refetchText="Обновить список кронов"
            enabledChecked={enabledFilter}
            enabledChanged={setEnabledFilter}
            disabledChecked={disabledFilter}
            disabledChanged={setDisabledFilter}
            title={`Созданные кроны (${crons?.count || 0}) для чата "${
              selectedChat.label
            }"`}
          />
        </Group>
      )}

      {crons?.items.map((cron) => (
        <Fragment key={cron.id}>
          {enabledFilter && cron.enabled && (
            <Group>
              <Cron {...cron} chatTitle={selectedChat?.label} />
            </Group>
          )}

          {disabledFilter && !cron.enabled && (
            <Group>
              <Cron {...cron} chatTitle={selectedChat?.label} />
            </Group>
          )}
        </Fragment>
      ))}

      <ScrollToTop />
    </>
  );
};
