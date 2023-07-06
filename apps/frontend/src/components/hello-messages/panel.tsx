import { Group, Header } from '@vkontakte/vkui';

import { FC } from 'react';

import { useGetChatsQuery } from '../../data/services/hello-messages-api';
import { ConvoSearch } from '../convo-search';

export const Panel: FC = () => {
  const { data: convos } = useGetChatsQuery();

  return (
    <Group>
      <Header>Установка приветственных сообщений в чаты</Header>
      <ConvoSearch
        convos={convos || []}
        value={undefined}
        onChange={() => undefined}
      />
    </Group>
  );
};
