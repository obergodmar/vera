import { createSelector } from '@reduxjs/toolkit';
import { Day, DutyChip } from '@vera-reforged/common';
import { Icon56CalendarOutline } from '@vkontakte/icons';
import {
  Avatar,
  Button,
  Caption,
  Group,
  Link,
  ModalPage,
  ModalPageHeader,
  ModalRoot,
  Panel,
  PanelHeader,
  PanelHeaderClose,
  PanelHeaderSubmit,
  Placeholder,
  SplitCol,
  SplitLayout,
  Text,
  useAdaptivityConditionalRender,
  View,
} from '@vkontakte/vkui';
import { ChipOption } from '@vkontakte/vkui/dist/components/Chip/Chip';

import { FC, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import { Panels, panels } from '../components/panels';
import { VERA_AVATAR_50 } from '../data/constants';
import { logOff, updateConfig } from '../data/reducers/authorization';
import { initialDays } from '../data/reducers/duties';
import { useUpdateDutiesMutation } from '../data/services/api';
import { useGetConfigQuery } from '../data/services/login';
import { RootState } from '../data/store';
import { ModalProvider, modalsIds } from '../hooks/useModal';
import { useSnackbar } from '../hooks/useSnackbar';
import { getToken } from '../utils/getToken';

const dutyResultSelector = createSelector(
  (state: RootState) => state.duties,
  (state) => {
    if (!state.current) {
      return {
        peerId: undefined,
        days: initialDays,
        duties: [],
        printData: [],
      };
    }
    const { days, duties } = state[state.current];
    const workingDays = days.filter(({ checked }) => checked);

    return {
      duties,
      printData: duties.slice(0, workingDays.length).map((item, idx) => ({
        ...item,
        day: workingDays[idx].name,
      })),
      days,
      peerId: state.current,
    };
  }
);

export const Content: FC = () => {
  const { data: config, refetch } = useGetConfigQuery();
  const snackbar = useSnackbar();
  const [fetch, { data, isLoading, isError }] = useUpdateDutiesMutation();

  const dispatch = useDispatch();

  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { sizeX } = useAdaptivityConditionalRender();

  const {
    printData,
    duties,
    peerId,
    days,
  }: {
    printData: ChipOption[];
    duties: DutyChip[];
    days: Day[];
    peerId: number | undefined;
  } = useSelector(dutyResultSelector);

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
    if (config) {
      dispatch(updateConfig(config));
    }
  }, [config, dispatch]);

  const closeModal = () => setActiveModal(null);

  const applyDuty = () => {
    if (!peerId) {
      return;
    }

    fetch({
      peerId,
      duties: {
        days,
        duties,
      },
    });

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
          >
            {printData.map(({ day, label, value, username }) => (
              <Text key={value}>
                В{' '}
                <Caption style={{ display: 'inline' }} caps weight="1">
                  {day}
                </Caption>{' '}
                дежурит{' '}
                <Link href={`https://vk.com/${username}`} target="_blank">
                  {label}
                </Link>
              </Text>
            ))}
          </Placeholder>
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

              <Outlet />
            </Panel>
          </View>
        </SplitCol>
      </SplitLayout>
    </ModalProvider>
  );
};
