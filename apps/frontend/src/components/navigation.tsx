import { Cell, Group } from '@vkontakte/vkui';

import { FC } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { panels } from './panels';

export const Navigation: FC = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const activePanel = pathname.replace('/', '');

  return (
    <Group>
      {panels.map((panel) => (
        <Cell
          key={panel.value}
          disabled={activePanel === panel.value}
          style={
            activePanel === panel.value
              ? {
                  backgroundColor: 'var(--vkui--color_background_secondary)',
                  borderRadius: 8,
                }
              : {}
          }
          onClick={() => navigate(`/${panel.value}`)}
        >
          {panel.label}
        </Cell>
      ))}
    </Group>
  );
};
