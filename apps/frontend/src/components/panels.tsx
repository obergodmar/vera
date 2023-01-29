import {
  Cell,
  Group,
  Panel,
  PanelHeader,
  SplitCol,
  useAdaptivityConditionalRender,
} from '@vkontakte/vkui';

import { FC, ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { DutyPanel } from './duty-panel';
import { NotImplementedPanel } from './not-implemented-panel';

export const panels: PanelItem[] = [
  {
    value: 'duty',
    label: 'Дежурные',
    content: <DutyPanel />,
  },
  {
    value: 'hello-messages',
    label: 'Приветственные сообщения',
    content: <NotImplementedPanel />,
  },
  {
    value: 'commands',
    label: 'Команды',
    content: <NotImplementedPanel />,
  },
  {
    value: 'mentions',
    label: 'Меншены',
    content: <NotImplementedPanel />,
  },
];

export type PanelItem = {
  value: 'mentions' | 'commands' | 'hello-messages' | 'duty';
  label: string;
  content: ReactNode;
};

export const Panels: FC = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { viewWidth } = useAdaptivityConditionalRender();

  const activePanel = pathname.replace('/', '');

  return (
    <>
      {viewWidth.tabletPlus && (
        <SplitCol
          className={viewWidth.tabletPlus.className}
          fixed
          width={280}
          maxWidth={280}
        >
          <Panel>
            <PanelHeader />

            <Group>
              {panels.map((panel) => (
                <Cell
                  key={panel.value}
                  disabled={activePanel === panel.value}
                  style={
                    activePanel === panel.value
                      ? {
                          backgroundColor:
                            'var(--vkui--color_background_secondary)',
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
          </Panel>
        </SplitCol>
      )}
    </>
  );
};
