import { Icon56DeleteOutline } from '@vkontakte/icons';
import {
  Avatar,
  Button,
  ButtonGroup,
  ModalCard,
  ModalRoot,
  Panel,
  PanelHeader,
  PanelHeaderBack,
  SplitCol,
  SplitLayout,
  useAdaptivityConditionalRender,
  useAdaptivityWithJSMediaQueries,
  View,
  ViewWidth,
} from '@vkontakte/vkui';

import { FC, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import { Navigation } from '../components/navigation';
import { PanelItem, panels } from '../components/panels';
import { VERA_AVATAR_50 } from '../data/constants';
import { resetSchedule } from '../data/reducers/duty';
import { ModalProvider, modalsIds } from '../hooks/useModal';

export const Content: FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const { viewWidth } = useAdaptivityConditionalRender();
  const { viewWidth: width } = useAdaptivityWithJSMediaQueries();

  const [activeModal, setActiveModal] = useState<modalsIds | null>(null);
  const [activePanel, setActivePanel] = useState(panels[0]);

  useEffect(() => {
    const pathnamePanel = pathname.replace('/', '');

    let panel: PanelItem | undefined;
    if (pathnamePanel === 'navigation') {
      panel = {
        content: <Navigation />,
        label: 'Раздел',
        value: 'navigation',
      };
    } else {
      panel = panels.find((panel) => panel.value === pathnamePanel);
    }

    if (!panel) {
      navigate(`/${panels[0].value}`);
    } else {
      setActivePanel(panel);
    }
  }, [navigate, pathname]);

  useEffect(() => {
    if (activePanel.value === 'navigation' && width >= ViewWidth.TABLET) {
      navigate(`/${panels[0].value}`);
    }
  }, [activePanel, navigate, width]);

  const closeModal = () => setActiveModal(null);

  const modal = (
    <ModalRoot activeModal={activeModal} onClose={closeModal}>
      <ModalCard
        id={modalsIds.resetSchedule}
        onClose={closeModal}
        icon={<Icon56DeleteOutline />}
        header="Подтверждение удаления изменений"
        subheader="В текущей сессии для выбранного чата все изменения будут сброшены. Продолжить?"
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
        {viewWidth.tabletPlus && (
          <SplitCol
            className={viewWidth.tabletPlus.className}
            fixed
            width={280}
            maxWidth={280}
          >
            <Panel>
              <PanelHeader />
              <Navigation />
            </Panel>
          </SplitCol>
        )}

        <SplitCol
          width="100%"
          maxWidth="560px"
          stretchedOnMobile
          autoSpaced
          animate={false}
        >
          <View activePanel={value}>
            <Panel id={value}>
              <PanelHeader
                shadow
                before={
                  width >= ViewWidth.TABLET ||
                  activePanel.value === 'navigation' ? (
                    <Avatar size={36} src={VERA_AVATAR_50} />
                  ) : (
                    <PanelHeaderBack onClick={() => navigate('/navigation')} />
                  )
                }
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
