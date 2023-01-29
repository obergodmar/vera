import { Icon56WriteOutline } from '@vkontakte/icons';
import { Group, Placeholder, Text } from '@vkontakte/vkui';

import { FC } from 'react';

export const NotImplementedPanel: FC = () => {
  return (
    <Group>
      <Placeholder icon={<Icon56WriteOutline />}>
        <Text>Этот раздел еще не готов</Text>
      </Placeholder>
    </Group>
  );
};
