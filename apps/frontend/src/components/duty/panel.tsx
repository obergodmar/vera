import { Icon20RefreshOutline } from '@vkontakte/icons';
import {
  Avatar,
  CustomSelectOption,
  FormItem,
  FormLayoutGroup,
  Group,
  Header,
  IconButton,
  PanelSpinner,
  Select,
} from '@vkontakte/vkui';

import { FC, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { setCurrentChatId, setDutyFromConfig } from '../../data/reducers/duty';
import {
  useGetDutyChatsQuery,
  useGetDutyConfigQuery,
} from '../../data/services/duty-api';
import { RootState } from '../../data/store';
import { Days } from './days';

export const Panel: FC = () => {
  const dispatch = useDispatch();

  const {
    isLoading: isConfigLoading,
    data: configResponse,
    // refetch: refetchConfig,
  } = useGetDutyConfigQuery();

  useEffect(() => {
    if (configResponse) {
      dispatch(setDutyFromConfig(configResponse));
    }
  }, [configResponse, dispatch]);

  const {
    isLoading: isChatsLoading,
    data: chats,
    refetch: refetchChats,
  } = useGetDutyChatsQuery();
  const chatId = useSelector((state: RootState) => state.duty.currentChatId);

  if (isConfigLoading || !configResponse || isChatsLoading || !chats) {
    return <PanelSpinner />;
  }

  return (
    <>
      <Group>
        <Header>Установка дежурства в чаты</Header>

        <FormLayoutGroup mode="horizontal">
          <FormItem top="Чат">
            <Select
              value={chatId}
              onChange={(e) => {
                const id = Number(e.target.value);
                dispatch(setCurrentChatId(id));
              }}
              placeholder="Не выбран"
              options={chats}
              renderOption={({
                option: { avatar, description },
                ...restProps
              }) => (
                <CustomSelectOption
                  {...restProps}
                  before={<Avatar size={24} src={avatar} />}
                  description={description}
                />
              )}
            />
          </FormItem>
          <FormItem>
            <IconButton aria-label="Обновить" onClick={refetchChats}>
              <Icon20RefreshOutline />
            </IconButton>
          </FormItem>
        </FormLayoutGroup>
      </Group>

      {chatId && <Days peerId={chatId} />}
    </>
  );
};
