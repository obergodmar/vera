import {
  Avatar,
  CustomSelectOption,
  FormItem,
  FormLayoutGroup,
  Group,
  Header,
  PanelSpinner,
  Select,
} from '@vkontakte/vkui';

import { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { setPeerId } from '../data/reducers/duties';
import { useGetConversationsQuery } from '../data/services/api';
import { RootState } from '../data/store';
import { DutyMembers } from './duty-members';

export const DutyPanel: FC = () => {
  const dispatch = useDispatch();
  const { isLoading, data: chats } = useGetConversationsQuery();
  const peerId = useSelector((state: RootState) => state.duties.current);

  if (isLoading || !chats) {
    return <PanelSpinner />;
  }

  return (
    <>
      <Group>
        <Header>Установка дежурства в чаты</Header>

        <FormLayoutGroup mode="vertical">
          <FormItem top="Чат">
            <Select
              value={peerId}
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
        </FormLayoutGroup>
      </Group>

      {peerId && <DutyMembers peerId={peerId} />}
    </>
  );
};
