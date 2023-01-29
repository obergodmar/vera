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

import { FC, useState } from 'react';

import { useGetConversationsQuery } from '../data/services/api';
import { DutyMembers } from './duty-members';

export const DutyPanel: FC = () => {
  const { isLoading, data: chats } = useGetConversationsQuery();
  const [peerId, setPeerId] = useState<number | undefined>();

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
              onChange={(e) => setPeerId(Number(e.target.value))}
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

      {peerId && (
        <Group>
          <DutyMembers peerId={peerId} />
        </Group>
      )}
    </>
  );
};
