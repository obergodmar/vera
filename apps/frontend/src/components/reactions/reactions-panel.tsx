import { Group, Header, PanelSpinner } from '@vkontakte/vkui';

import { FC, Fragment, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { setCurrentChatId } from '../../data/reducers/reactions';
import { useGetChatsQuery } from '../../data/services/convo-api';
import { useGetReactionsForChatQuery } from '../../data/services/reactions-api';
import { RootState } from '../../data/store';
import { ConvoSearch } from '../convo-search';
import { FilterGroup } from '../filter-group';
import { ScrollToTop } from '../scroll-to-top';
import { Reaction } from './reaction';
import { ReactionsChat } from './reactions-chat';

export const ReactionsPanel: FC = () => {
  const dispatch = useDispatch();
  const [enabledFilter, setEnabledFilter] = useState(true);
  const [disabledFilter, setDisabledFilter] = useState(true);

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
          disableUpdatedConvosSwitch
        />

        {!!chatId && selectedChat && (
          <ReactionsChat chatTitle={selectedChat.label} chatId={chatId} />
        )}
      </Group>

      {!!chatId && selectedChat && (
        <Group>
          <FilterGroup
            refetch={refetchReactions}
            refetchText="Обновить список реакций"
            enabledChecked={enabledFilter}
            enabledChanged={setEnabledFilter}
            disabledChecked={disabledFilter}
            disabledChanged={setDisabledFilter}
            title={`Созданные реакции (${reactions?.count || 0}) для чата "${
              selectedChat.label
            }"`}
          />
        </Group>
      )}

      {reactions?.items.map((reaction) => (
        <Fragment key={reaction.id}>
          {enabledFilter && reaction.enabled && (
            <Group>
              <Reaction {...reaction} />
            </Group>
          )}

          {disabledFilter && !reaction.enabled && (
            <Group>
              <Reaction {...reaction} />
            </Group>
          )}
        </Fragment>
      ))}

      <ScrollToTop />
    </>
  );
};
