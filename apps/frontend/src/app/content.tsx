import { Icon56CalendarOutline } from '@vkontakte/icons';
import {
  Avatar,
  Button,
  Group,
  ModalPage,
  ModalPageHeader,
  ModalRoot,
  Panel,
  PanelHeader,
  PanelHeaderClose,
  PanelHeaderSubmit,
  PanelSpinner,
  Placeholder,
  SplitCol,
  SplitLayout,
  useAdaptivityConditionalRender,
  View,
} from '@vkontakte/vkui';

import { FC, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import { Panels, panels } from '../components/panels';
import { VERA_AVATAR_50 } from '../data/constants';
import { setConfig } from '../data/reducers/config';
import { useUpdateDutiesMutation } from '../data/services/api';
import { useGetConfigQuery } from '../data/services/login';
import { RootState } from '../data/store';
import { ModalProvider, modalsIds } from '../hooks/useModal';
import { useSnackbar } from '../hooks/useSnackbar';

export const Content: FC = () => {
  const { data: configResponse, refetch } = useGetConfigQuery();
  const snackbar = useSnackbar();
  const [fetch, { data, isLoading, isError }] = useUpdateDutiesMutation();

  const dispatch = useDispatch();
  const config = useSelector((state: RootState) => state.config);

  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { sizeX } = useAdaptivityConditionalRender();

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

  useEffect(() => {
    if (isError) {
      snackbar({
        message: 'Ошибка',
      });
      console.error(data);
    }

    if (data?.success) {
      snackbar({
        message: 'Успешно',
      });

      refetch();
    }
  }, [isError, data, snackbar, refetch]);

  useEffect(() => {
    if (configResponse) {
      dispatch(setConfig(configResponse));
    }
  }, [configResponse, dispatch]);

  const closeModal = () => setActiveModal(null);

  const applyDuty = () => {
    closeModal();
  };

  const modal = (
    <ModalRoot activeModal={activeModal} onClose={closeModal}>
      <ModalPage
        id={modalsIds.dutyCheckout}
        onClose={closeModal}
        header={
          <ModalPageHeader
            before={
              sizeX.compact && (
                <PanelHeaderClose
                  className={sizeX.compact.className}
                  onClick={() => setActiveModal(null)}
                />
              )
            }
            after={<PanelHeaderSubmit onClick={applyDuty} />}
          >
            Расписание
          </ModalPageHeader>
        }
      >
        <Group>
          <Placeholder
            icon={<Icon56CalendarOutline />}
            action={
              <Button loading={isLoading} onClick={applyDuty}>
                Применить
              </Button>
            }
          ></Placeholder>
        </Group>
      </ModalPage>
    </ModalRoot>
  );

  return (
    <ModalProvider open={(id) => setActiveModal(id)}>
      <SplitLayout
        style={{ justifyContent: 'center' }}
        header={<PanelHeader separator={false} />}
        modal={modal}
      >
        <Panels />

        <SplitCol width="100%" maxWidth="560px" stretchedOnMobile autoSpaced>
          <View activePanel={activePanel.value}>
            <Panel id={activePanel.value}>
              <PanelHeader after={<Avatar size={36} src={VERA_AVATAR_50} />}>
                {activePanel.label}
              </PanelHeader>

              {config ? <Outlet /> : <PanelSpinner />}
            </Panel>
          </View>
        </SplitCol>
      </SplitLayout>
    </ModalProvider>
  );
};
