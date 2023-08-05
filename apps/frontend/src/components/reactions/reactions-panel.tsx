import { Group, Header, PanelSpinner } from '@vkontakte/vkui';

import { FC } from 'react';
import { useDispatch } from 'react-redux';

import { setCurrentChatId } from '../../data/reducers/reactions';
import { useGetChatsQuery } from '../../data/services/convo-api';
import { ConvoSearch } from '../convo-search';

export const ReactionsPanel: FC = () => {
  const dispatch = useDispatch();

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
        onChange={(id) => dispatch(setCurrentChatId(id))}
        refetchConvos={refetchChats}
      />
    </Group>
  );
};
