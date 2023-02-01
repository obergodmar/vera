import { createSelector } from '@reduxjs/toolkit';
import { DutyChip } from '@vera-reforged/common';
import { Icon24ErrorCircle } from '@vkontakte/icons';
import {
  Avatar,
  Button,
  ButtonGroup,
  Cell,
  Chip,
  CustomSelectOption,
  FormItem,
  FormLayoutGroup,
  List,
  RichCell,
  Spacing,
  Spinner,
  Switch,
  unstable_ChipsSelect as ChipsSelect,
} from '@vkontakte/vkui';

import { FC, useCallback } from 'react';
import { batch, useDispatch, useSelector } from 'react-redux';
import TimePicker from 'react-time-picker/dist/entry.nostyle';

import './duty-members.css';

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

export const DutyMembers: FC<Props> = ({ peerId }) => {
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
      <FormItem top="Дежурные">
        <ChipsSelect
          value={duties}
          onChangeStart={(e) => {
            if (duties.length === days.length) {
              e.preventDefault();

              snackbar({
                message: 'Людей выбрано больше, чем рабочих дней недели',
                before: (
                  <Icon24ErrorCircle fill="var(--vkui--color_icon_accent)" />
                ),
              });
            }
          }}
          onChange={(items) =>
            dispatch(setDuties({ duties: items as DutyChip[], peerId }))
          }
          options={members}
          showSelected={false}
          renderChip={(props) => {
            if (!props) {
              return;
            }

            const {
              value,
              label,
              option: { avatar },
              ...rest
            } = props;

            return (
              <Chip
                value={value}
                before={<Avatar size={20} src={avatar} />}
                {...rest}
              >
                {props?.label}
              </Chip>
            );
          }}
          renderOption={({ option: { avatar, username }, ...otherProps }) => {
            return (
              <CustomSelectOption
                before={<Avatar size={20} src={avatar} />}
                description={username}
                {...otherProps}
              />
            );
          }}
        />
      </FormItem>

      <FormLayoutGroup mode="horizontal">
        <FormItem top="Дежурство по" style={{ flexGrow: 1.15 }}>
          <List>
            {days.map(({ name, checked, value, time }, idx) => (
              <RichCell
                disabled
                name={name}
                key={value}
                before={
                  <Avatar
                    initials={name}
                    gradientColor={checked ? 'blue' : undefined}
                  />
                }
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px',
                  }}
                >
                  <span>c</span>
                  <TimePicker
                    value={time || ''}
                    onChange={(newTime) => {
                      dispatch(
                        setTime({ idx, peerId, value: newTime as string })
                      );
                    }}
                    locale="ru-ru"
                    autoFocus={false}
                    clearIcon={null}
                    disableClock
                    hourPlaceholder="чч"
                    minutePlaceholder="мм"
                    format="HH:mm"
                  />

                  <Switch
                    checked={checked}
                    onChange={({ target }) => {
                      dispatch(
                        sortDays({
                          checked: target.checked,
                          idx,
                          peerId,
                        })
                      );
                    }}
                  />
                </div>
              </RichCell>
            ))}
          </List>
        </FormItem>

        <FormItem top="В этот день дежурит" style={{ flexGrow: 2 }}>
          <List>
            {duties.map(({ value, label, avatar }, idx) => (
              <Cell
                style={{ padding: '4px 0' }}
                key={value}
                before={<Avatar src={avatar} />}
                mode="removable"
                draggable
                onDragFinish={(args) =>
                  dispatch(dragDuties({ ...args, peerId }))
                }
                onRemove={() => dispatch(removeDuty({ idx, peerId }))}
              >
                {label}
              </Cell>
            ))}
          </List>
        </FormItem>
      </FormLayoutGroup>

      <Spacing />

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
