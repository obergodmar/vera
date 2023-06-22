import { Group, Header } from '@vkontakte/vkui';

import { FC } from 'react';

import { ConvoSearch } from '../convo-search';

export const Panel: FC = () => {
  return (
    <Group>
      <Header>Установка приветственных сообщений в чаты</Header>
      <ConvoSearch convos={[]} value={undefined} onChange={() => {}} />
    </Group>
  );
};
