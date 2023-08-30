import { Icon20RefreshOutline } from '@vkontakte/icons';
import {
  Group,
  Header,
  IconButton,
  PanelSpinner,
  SimpleCell,
  Switch,
  Text,
} from '@vkontakte/vkui';
import { TextTooltip } from '@vkontakte/vkui/dist/components/TextTooltip/TextTooltip';

import { FC, Fragment, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { setCurrentChatId } from '../../data/reducers/reactions';
import { useGetChatsQuery } from '../../data/services/convo-api';
import { useGetReactionsForChatQuery } from '../../data/services/reactions-api';
import { RootState } from '../../data/store';
import { ConvoSearch } from '../convo-search';
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
        />

        {!!chatId && selectedChat && (
          <ReactionsChat chatTitle={selectedChat.label} chatId={chatId} />
        )}
      </Group>

      {!!chatId && selectedChat && (
        <Group>
          <SimpleCell
            after={
              <TextTooltip text="Обновить список реакций">
                <IconButton
                  aria-label="Обновить список реакций"
                  onClick={refetchReactions}
                  style={{
                    minWidth: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--vkui--color_text_subhead)',
                  }}
                >
                  <Icon20RefreshOutline />
                </IconButton>
              </TextTooltip>
            }
          >
            <Text style={{ fontWeight: 600 }}>
              Созданные реакции ({reactions?.count || 0}) для чата "
              {selectedChat.label}"
            </Text>
          </SimpleCell>
          <SimpleCell
            Component="label"
            after={
              <Switch
                checked={enabledFilter}
                onChange={({ target: { checked } }) => {
                  setEnabledFilter(checked);

                  if (!checked && !disabledFilter) {
                    setDisabledFilter(true);
                  }
                }}
              />
            }
          >
            Включенные
          </SimpleCell>
          <SimpleCell
            Component="label"
            after={
              <Switch
                checked={disabledFilter}
                onChange={({ target: { checked } }) => {
                  setDisabledFilter(checked);

                  if (!checked && !enabledFilter) {
                    setEnabledFilter(true);
                  }
                }}
              />
            }
          >
            Отключенные
          </SimpleCell>
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
