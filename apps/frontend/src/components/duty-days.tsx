import { createSelector } from '@reduxjs/toolkit';
import { DutyChip } from '@vera-reforged/common';
import { Icon16Hashtag, Icon24ErrorCircle } from '@vkontakte/icons';
import {
  Avatar,
  Button,
  ButtonGroup,
  Cell,
  Chip,
  CustomSelectOption,
  Div,
  FormItem,
  FormLayoutGroup,
  Group,
  Input,
  List,
  RichCell,
  Spacing,
  Spinner,
  Switch,
  Text,
  unstable_ChipsSelect as ChipsSelect,
} from '@vkontakte/vkui';

import { FC, useCallback } from 'react';
import { batch, useDispatch, useSelector } from 'react-redux';
import TimePicker from 'react-time-picker/dist/entry.nostyle';

import './duty-members.css';
import * as rn from 'russian-nouns-js';

import {
  dragDuties,
  initialDuties,
  removeDuty,
  setDays,
  setDuties,
  setTime,
  sortDays,
} from '../data/reducers/duties';
import { useGetConversationMembersQuery } from '../data/services/api';
import { RootState } from '../data/store';
import { modalsIds, useModal } from '../hooks/useModal';
import { useSnackbar } from '../hooks/useSnackbar';
import { getDutiesFromConfig } from '../utils/getDutiesFromConfig';
import { DutyPicker } from './duty-picker';

type Props = {
  peerId: number;
};

const initialDutiesSelector = createSelector(
  (state: RootState) => state.authorization.config,
  (state: RootState) => state.duties.current,
  (config, peerId) => {
    if (config && peerId) {
      return getDutiesFromConfig(config, peerId);
    }

    return { ...initialDuties };
  }
);

export const DutyDays: FC<Props> = ({ peerId }) => {
  const open = useModal();
  const snackbar = useSnackbar();
  const { isLoading, data: members } = useGetConversationMembersQuery(peerId);

  const dispatch = useDispatch();

  const initialDuties = useSelector(initialDutiesSelector);
  const duties = useSelector((state: RootState) => state.duties[peerId].duties);
  const days = useSelector((state: RootState) => state.duties[peerId].days);

  const reset = useCallback(() => {
    const { duties, days } = initialDuties;

    batch(() => {
      dispatch(setDuties({ peerId, duties }));
      dispatch(setDays({ peerId, days }));
    });
  }, [dispatch, initialDuties, peerId]);

  if (isLoading || !members) {
    return <Spinner />;
  }

  return (
    <>
      {days.map(({ name, fullName, value, checked }) => {
        const rne = new rn.Engine();

        const dayName = rn.createLemma({
          text: fullName,
          gender: rn.Gender.COMMON,
        });

        const [dayNameWithCase] = rne.decline(dayName, rn.Case.ACCUSATIVE);

        const preposition = dayNameWithCase.startsWith('в') ? 'во' : 'в';

        return (
          <Group>
            <FormItem
              top={
                <div style={{ display: 'flex', gap: '10px' }}>
                  <Switch checked={checked} />
                  <Text>{fullName}</Text>
                </div>
              }
            >
              <RichCell
                disabled
                subhead="Результат"
                name={name}
                key={value}
                before={
                  <Avatar
                    initials={name}
                    gradientColor={checked ? 'blue' : undefined}
                  />
                }
              >
                Дежурства {preposition} {dayNameWithCase} отсутствуют
              </RichCell>
            </FormItem>

            {checked && (
              <FormItem top="Смена 1">
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                  }}
                >
                  <Input
                    style={{ maxWidth: '75px' }}
                    before={<Icon16Hashtag />}
                  />
                  <div
                    style={{
                      flexGrow: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                    }}
                  >
                    c <TimePicker value="" disableClock clearIcon={null} /> по
                    <TimePicker value="" disableClock clearIcon={null} />
                  </div>
                  <DutyPicker members={members} />
                </div>
              </FormItem>
            )}
          </Group>
        );
      })}

      <ButtonGroup align="right" stretched mode="vertical">
        <ButtonGroup stretched={false}>
          <Button mode="secondary" appearance="negative" onClick={reset}>
            Сбросить
          </Button>
          <Button onClick={() => open(modalsIds.dutyCheckout)}>
            Применить дежурство
          </Button>
        </ButtonGroup>
      </ButtonGroup>

      <Spacing />
    </>
  );
};
