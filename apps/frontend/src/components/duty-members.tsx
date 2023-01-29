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
  Spacing,
  Spinner,
  unstable_ChipsSelect as ChipsSelect,
} from '@vkontakte/vkui';

import { FC, useCallback } from 'react';
import { batch, useDispatch, useSelector } from 'react-redux';

import {
  dragDuties,
  initialDuties,
  removeDuty,
  setDays,
  setDuties,
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
        <FormItem top="Дежурство по" style={{ flexGrow: 1 }}>
          <List>
            {days.map(({ name, checked, value }, idx) => (
              <Cell
                name={name}
                key={value}
                before={<Avatar initials={name} />}
                mode="selectable"
                checked={checked}
                onChange={({ target }) => {
                  dispatch(
                    sortDays({
                      checked: (target as HTMLInputElement).checked,
                      idx,
                      peerId,
                    })
                  );
                }}
              />
            ))}
          </List>
        </FormItem>

        <FormItem top="В этот день дежурит" style={{ flexGrow: 2 }}>
          <List>
            {duties.map(({ value, label, avatar }, idx) => (
              <Cell
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
