import { CellButton, Group, Header, PanelSpinner } from '@vkontakte/vkui';

import { FC, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { setCurrentChatId } from '../../data/reducers/crons';
import { useGetChatsQuery } from '../../data/services/convo-api';
import { RootState } from '../../data/store';
import { ConvoSearch } from '../convo-search';
import { ScrollToTop } from '../scroll-to-top';
import { CronsChat } from './crons-chat';

export const CronsPanel: FC = () => {
  const dispatch = useDispatch();

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

  if (isChatsLoading) {
    return <PanelSpinner>Реакции загружаются</PanelSpinner>;
  }

  return (
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
            <Group mode="plain">
              <CellButton mode="danger">
                Выключить все кроны для этого чата
              </CellButton>
            </Group>

            <CronsChat chatTitle={selectedChat.label} chatId={chatId} />
          </>
        )}
      </Group>

      <ScrollToTop />
    </Group>
  );
};
