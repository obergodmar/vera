import { Group, Header, PanelSpinner } from '@vkontakte/vkui';

import { FC } from 'react';

import { useGetChatsQuery } from '../../data/services/convo-api';
import { ConvoSearch } from '../convo-search';

export const ReactionsPanel: FC = () => {
  const {
    isLoading: isChatsLoading,
    data: chats = [],
    refetch: refetchChats,
  } = useGetChatsQuery();

  if (isChatsLoading) {
    return <PanelSpinner>Реакции загружаются</PanelSpinner>;
  }

  return (
    <Group description="Можно использовать регулярные выражения, чтобы точно задать слово или фразу, на которое должна быть отправлена соответствующая реакция">
      <Header>Установка реакций</Header>
      <ConvoSearch
        value={undefined}
        convos={chats}
        onChange={(id) => undefined}
        refetchConvos={refetchChats}
      />
    </Group>
  );
};
