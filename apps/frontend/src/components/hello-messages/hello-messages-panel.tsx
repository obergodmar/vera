import { createSelector } from '@reduxjs/toolkit';
import { Group, Header, PanelSpinner } from '@vkontakte/vkui';

import { FC, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  setCurrentChatId,
  setCurrentMessages,
} from '../../data/reducers/hello-messages';
import { useGetChatsQuery } from '../../data/services/convo-api';
import { useGetHelloMessagesQuery } from '../../data/services/hello-messages-api';
import { RootState } from '../../data/store';
import { ConvoSearch } from '../convo-search';
import { Message } from './message';
import { SelectedChat } from './selected-chat';

const chatMessageSelector = (chatId: number | undefined) =>
  createSelector(
    (state: RootState) => state.helloMessages.updatedMessages,
    (messages) => {
      if (chatId) {
        return messages.find(({ chatId: id }) => id === chatId)?.message || '';
      }

      return '';
    }
  );

export const HelloMessagesPanel: FC = () => {
  const dispatch = useDispatch();

  const {
    isLoading: isChatsLoading,
    data: chats = [],
    refetch: refetchChats,
  } = useGetChatsQuery();

  const { data: helloMessages, isLoading: isHelloMessagesLoading } =
    useGetHelloMessagesQuery();

  const chatId = useSelector(
    (state: RootState) => state.helloMessages.currentChatId
  );
  const selectedChat = useMemo(
    () => chats.find(({ value }) => value === chatId),
    [chatId, chats]
  );
  const message = useSelector(chatMessageSelector(chatId));

  useEffect(() => {
    const items = helloMessages?.items.map(({ peer, helloMessage }) => ({
      chatId: peer.id,
      message: helloMessage,
    }));

    if (items?.length) {
      dispatch(setCurrentMessages(items));
    }
  }, [dispatch, helloMessages]);

  if (isChatsLoading || isHelloMessagesLoading) {
    return <PanelSpinner />;
  }

  return (
    <>
      <Group>
        <Header>Установка приветственных сообщений в чаты</Header>
        <ConvoSearch
          value={undefined}
          convos={chats}
          onChange={(id) => dispatch(setCurrentChatId(id))}
          refetchConvos={refetchChats}
        />

        {!!chatId && selectedChat && (
          <SelectedChat
            message={message}
            chatTitle={selectedChat.label}
            chatId={chatId}
          />
        )}
      </Group>

      {helloMessages?.items.map((chat) => (
        <Group key={chat.id}>
          <Message chat={chat} />
        </Group>
      ))}
    </>
  );
};
