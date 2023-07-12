import { createSelector } from '@reduxjs/toolkit';
import { IDuty } from '@vera-reforged/common';
import { Icon24ErrorCircle } from '@vkontakte/icons';

import { FC, useEffect } from 'react';
import { useSelector } from 'react-redux';

import { equals } from 'ramda';

import { useUpdateChatScheduleMutation } from '../../data/services/duty-api';
import { RootState } from '../../data/store';
import { useSnackbar } from '../../hooks/useSnackbar';
import { PanelSubmit } from '../panel-submit';

export const chatSchedule = createSelector(
  (state: RootState) => state.duty,
  ({ schedule, currentChatId, currentSchedule }) => {
    const chatSchedule: IDuty.Schedule[] =
      (currentChatId && schedule?.[currentChatId]) || [];

    const modified = !equals(chatSchedule, currentSchedule);

    return {
      modified,
      chatId: currentChatId,
      schedule: chatSchedule.filter((duty) => duty.firstName && duty.lastName),
    };
  }
);

export const DutySubmit: FC = () => {
  const snackbar = useSnackbar();

  const { chatId, schedule, modified } = useSelector(chatSchedule);
  const [submit, { data }] = useUpdateChatScheduleMutation();

  useEffect(() => {
    if (data) {
      snackbar({
        message: 'Дежурство обновлено',
        before: <Icon24ErrorCircle fill="var(--vkui--color_icon_accent)" />,
      });
    }
  }, [data, snackbar]);

  if (!chatId) {
    return null;
  }

  return (
    <PanelSubmit
      modified={modified}
      onSubmit={() => submit({ chatId, schedule })}
    />
  );
};
