import { Group, Header, PanelSpinner } from '@vkontakte/vkui';

import { FC, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { useGetChatsQuery } from '../../data/services/convo-api';
import { RootState } from '../../data/store';
import { ConvoSearch } from '../convo-search';

export const CronsPanel: FC = () => {
  const {
    isLoading: isChatsLoading,
    data: chats = [],
    refetch: refetchChats,
  } = useGetChatsQuery();

  const chatId = useSelector(
    (state: RootState) => state.reactions.currentChatId,
  );
  const selectedChat = useMemo(
    () => chats.find(({ value }) => value === chatId),
    [chatId, chats],
  );

  if (isChatsLoading) {
    return <PanelSpinner>Реакции загружаются</PanelSpinner>;
  }

  return (
    <Group>
        <Header>Установка реакций</Header>
        <ConvoSearch
          value={chatId}
          convos={chats}
          onChange={(id) => dispatch(setCurrentChatId(id))}
          refetchConvos={refetchChats}
        />
      </Group>
  );
};
