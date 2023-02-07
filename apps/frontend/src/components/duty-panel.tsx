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

import { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { setPeerId } from '../data/reducers/duties';
import { useGetConversationsQuery } from '../data/services/api';
import { RootState } from '../data/store';
import { DutyDays } from './duty-days';

export const DutyPanel: FC = () => {
  const dispatch = useDispatch();
  const { isLoading, data: chats, refetch } = useGetConversationsQuery();
  const chatId = useSelector((state: RootState) => state.duties.current);

  if (isLoading || !chats) {
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
                dispatch(setPeerId(id));
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
            <IconButton aria-label="Обновить" onClick={refetch}>
              <Icon20RefreshOutline />
            </IconButton>
          </FormItem>
        </FormLayoutGroup>
      </Group>

      {chatId && <DutyDays peerId={chatId} />}
    </>
  );
};
