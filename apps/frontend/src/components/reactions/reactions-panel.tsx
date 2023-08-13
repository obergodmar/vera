import { Group, Header, PanelSpinner } from '@vkontakte/vkui';

import { FC, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { setCurrentChatId } from '../../data/reducers/reactions';
import { useGetChatsQuery } from '../../data/services/convo-api';
import { useGetReactionsForChatQuery } from '../../data/services/reactions-api';
import { RootState } from '../../data/store';
import { ConvoSearch } from '../convo-search';
import { Reaction } from './reaction';
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

  const {
    isLoading: isReactionsLoading,
    data: reactions,
    refetch: refetchReactions,
  } = useGetReactionsForChatQuery({ chatId }, { skip: !chatId });

  console.log(chatId)

  if (isChatsLoading || isReactionsLoading) {
    return <PanelSpinner>Реакции загружаются</PanelSpinner>;
  }

  return (
    <>
      <Group>
        <Header>Установка реакций</Header>
        <ConvoSearch
          value={chatId}
          convos={chats}
          onChange={(id) => dispatch(setCurrentChatId(id))}
          refetchConvos={refetchChats}
        />

        {!!chatId && selectedChat && (
          <ReactionsChat chatTitle={selectedChat.label} chatId={chatId} />
        )}
      </Group>

      {reactions?.items.map((reaction) => (
        <Group key={reaction.id}>
          <Reaction {...reaction} />
        </Group>
      ))}
    </>
  );
};
