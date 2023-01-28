import { Avatar, Group, Panel, PanelHeader } from '@vkontakte/vkui';

import { FC } from 'react';

import { VERA_AVATAR_50 } from '../data/constants';

export const DutyPanel: FC = () => {
  return (
    <Panel id="duty">
      <PanelHeader after={<Avatar size={36} src={VERA_AVATAR_50} />}>
        Дежурные
      </PanelHeader>

      <Group></Group>
    </Panel>
  );
};
