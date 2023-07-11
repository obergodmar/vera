import { Group, Header, PanelSpinner } from '@vkontakte/vkui';

import { FC } from 'react';

import { useGetChatsQuery } from '../../data/services/convo-api';
import { useGetHelloMessagesQuery } from '../../data/services/hello-messages-api';
import { ConvoSearch } from '../convo-search';

export const Panel: FC = () => {
  const {
    isLoading: isChatsLoading,
    data: chats = [],
    refetch: refetchChats,
  } = useGetChatsQuery();

  const { data: helloMessages, isLoading: isHelloMessagesLoading } =
    useGetHelloMessagesQuery();

  console.log(helloMessages);

  if (isChatsLoading || isHelloMessagesLoading) {
    return <PanelSpinner />;
  }

  return (
    <Group>
      <Header>Установка приветственных сообщений в чаты</Header>
      <ConvoSearch
        value={undefined}
        convos={chats}
        onChange={(id) => undefined}
        refetchConvos={refetchChats}
      />
    </Group>
  );
};
