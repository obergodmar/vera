import { Group, Header, PanelSpinner } from '@vkontakte/vkui';

import { FC, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { setCurrentChatId } from '../../data/reducers/reactions';
import { useGetChatsQuery } from '../../data/services/convo-api';
import { RootState } from '../../data/store';
import { ConvoSearch } from '../convo-search';
import { ReactionsChat } from './reactions-chat';

export const ReactionsPanel: FC = () => {
  const dispatch = useDispatch();

  const {
    isLoading: isChatsLoading,
    data: chats = [],
    refetch: refetchChats,
  } = useGetChatsQuery();

  const chatId = useSelector(
    (state: RootState) => state.reactions.currentChatId
  );
  const selectedChat = useMemo(
    () => chats.find(({ value }) => value === chatId),
    [chatId, chats]
  );

  if (isChatsLoading) {
    return <PanelSpinner>Реакции загружаются</PanelSpinner>;
  }

  return (
    <Group>
      <Header>Установка реакций</Header>
      <ConvoSearch
        value={undefined}
        convos={chats}
        onChange={(id) => dispatch(setCurrentChatId(id))}
        refetchConvos={refetchChats}
      />

      {!!chatId && selectedChat && (
        <ReactionsChat
          trigger=""
          reaction=""
          currentTrigger=""
          currentReaction=""
          chatTitle={selectedChat.label}
          chatId={chatId}
        />
      )}
    </Group>
  );
};
