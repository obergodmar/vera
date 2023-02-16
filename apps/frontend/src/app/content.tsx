import { Icon56DeleteOutline } from '@vkontakte/icons';
import {
  Avatar,
  Button,
  ButtonGroup,
  ModalCard,
  ModalRoot,
  Panel,
  PanelHeader,
  SplitCol,
  SplitLayout,
  View,
} from '@vkontakte/vkui';

import { FC, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import { Panels, panels } from '../components/panels';
import { VERA_AVATAR_50 } from '../data/constants';
import { resetSchedule } from '../data/reducers/duty';
import { ModalProvider, modalsIds } from '../hooks/useModal';

export const Content: FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [activeModal, setActiveModal] = useState<modalsIds | null>(null);
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

  const closeModal = () => setActiveModal(null);

  const modal = (
    <ModalRoot activeModal={activeModal} onClose={closeModal}>
      <ModalCard
        id={modalsIds.resetSchedule}
        onClose={closeModal}
        icon={<Icon56DeleteOutline />}
        header="Подтверждение удаления изменений"
        subheader="В текущей сессии все изменения во всех чатах будут сброшены. Продолжить?"
        actions={
          <ButtonGroup stretched>
            <Button
              size="l"
              mode="primary"
              appearance="negative"
              stretched
              onClick={() => {
                dispatch(resetSchedule());
                closeModal();
              }}
            >
              Продолжить
            </Button>
            <Button
              size="l"
              mode="secondary"
              appearance="neutral"
              stretched
              onClick={closeModal}
            >
              Отмена
            </Button>
          </ButtonGroup>
        }
      ></ModalCard>
    </ModalRoot>
  );

  const { value, label, cancel, submit, edit } = activePanel;

  return (
    <ModalProvider open={(id) => setActiveModal(id)}>
      <SplitLayout
        style={{ justifyContent: 'center' }}
        header={<PanelHeader separator={false} shadow />}
        modal={modal}
      >
        <Panels />

        <SplitCol width="100%" maxWidth="560px" stretchedOnMobile autoSpaced>
          <View activePanel={value}>
            <Panel id={value}>
              <PanelHeader
                shadow
                before={<Avatar size={36} src={VERA_AVATAR_50} />}
                after={
                  (cancel || submit || edit) && (
                    <div style={{ display: 'flex' }}>
                      {cancel}
                      {edit}
                      {submit}
                    </div>
                  )
                }
              >
                {label}
              </PanelHeader>

              <Outlet />
            </Panel>
          </View>
        </SplitCol>
      </SplitLayout>
    </ModalProvider>
  );
};
