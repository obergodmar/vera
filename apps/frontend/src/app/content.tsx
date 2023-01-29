import {
  Avatar,
  Panel,
  PanelHeader,
  SplitCol,
  SplitLayout,
  View,
} from '@vkontakte/vkui';

import { FC, useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import { Panels, panels } from '../components/panels';
import { VERA_AVATAR_50 } from '../data/constants';

export const Content: FC = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [activePanel, setActivePanel] = useState(panels[0]);

  useEffect(() => {
    const pathnamePanel = pathname.replace('/', '');
    const panel = panels.find((panel) => panel.value === pathnamePanel);

    if (!panel) {
      navigate(`/${panels[0].value}`);
    } else {
      setActivePanel(panel);
    }
  }, [activePanel, navigate, pathname]);

  return (
    <SplitLayout
      style={{ justifyContent: 'center' }}
      header={<PanelHeader separator={false} />}
    >
      <Panels />

      <SplitCol width="100%" maxWidth="560px" stretchedOnMobile autoSpaced>
        <View activePanel={activePanel.value}>
          <Panel id={activePanel.value}>
            <PanelHeader after={<Avatar size={36} src={VERA_AVATAR_50} />}>
              {activePanel.label}
            </PanelHeader>

            <Outlet />
          </Panel>
        </View>
      </SplitCol>
    </SplitLayout>
  );
};
