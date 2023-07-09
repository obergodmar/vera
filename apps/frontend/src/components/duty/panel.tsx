import { Group, Header, PanelSpinner } from '@vkontakte/vkui';

import { FC, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { setCurrentChatId, setDutyDays } from '../../data/reducers/duty';
import {
  useGetChatsQuery,
  useGetDaysQuery,
} from '../../data/services/duty-api';
import { RootState } from '../../data/store';
import { ConvoSearch } from '../convo-search';
import { ScrollToTop } from '../scroll-to-top';
import { Days } from './days';

export const Panel: FC = () => {
  const dispatch = useDispatch();

  const { isLoading: isDaysLoading, data: days } = useGetDaysQuery();

  useEffect(() => {
    if (days) {
      dispatch(setDutyDays(days));
    }
  }, [days, dispatch]);

  const {
    isLoading: isChatsLoading,
    data: chats = [],
    refetch: refetchChats,
  } = useGetChatsQuery();

  const chatId = useSelector((state: RootState) => state.duty.currentChatId);

  if (isDaysLoading || isChatsLoading) {
    return <PanelSpinner />;
  }

  return (
    <>
      <Group>
        <Header>Установка дежурства в чаты</Header>
        <ConvoSearch
          value={chatId}
          convos={chats}
          onChange={(id) => dispatch(setCurrentChatId(id))}
          refetchConvos={refetchChats}
        />
      </Group>

      {!!chatId && <Days peerId={chatId} />}

      <ScrollToTop />
    </>
  );
};
