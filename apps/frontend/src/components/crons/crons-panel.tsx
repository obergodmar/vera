import { CellButton, Group, Header, PanelSpinner } from '@vkontakte/vkui';

import { FC, Fragment, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { setCurrentChatId } from '../../data/reducers/crons';
import { useGetChatsQuery } from '../../data/services/convo-api';
import { useGetCronsForChatQuery } from '../../data/services/crons-api';
import { RootState } from '../../data/store';
import { ConvoSearch } from '../convo-search';
import { FilterGroup } from '../filter-group';
import { ScrollToTop } from '../scroll-to-top';
import { Cron } from './cron';
import { CronsChat } from './crons-chat';

export const CronsPanel: FC = () => {
  const dispatch = useDispatch();
  const [enabledFilter, setEnabledFilter] = useState(true);
  const [disabledFilter, setDisabledFilter] = useState(true);

  const {
    isLoading: isChatsLoading,
    data: chats = [],
    refetch: refetchChats,
  } = useGetChatsQuery();

  const chatId = useSelector((state: RootState) => state.crons.currentChatId);
  const selectedChat = useMemo(
    () => chats.find(({ value }) => value === chatId),
    [chatId, chats]
  );

  const {
    isLoading: isCronsLoading,
    data: crons,
    refetch: refetchCrons,
  } = useGetCronsForChatQuery({ chatId }, { skip: !chatId });

  if (isChatsLoading || isCronsLoading) {
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
          <CellButton mode="danger">
            Выключить все кроны (во всех чатах)
          </CellButton>
        </Group>

        <Group mode="plain">
          <Header>Установка крона в чат</Header>
          <ConvoSearch
            value={chatId}
            convos={chats}
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
          <CellButton mode="danger" disabled={!crons?.count}>
            Выключить все кроны для этого чата ({crons?.count || 0})
          </CellButton>

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
