import { createSelector } from '@reduxjs/toolkit';
import { Icon24ErrorCircle } from '@vkontakte/icons';

import { FC, useEffect } from 'react';
import { useSelector } from 'react-redux';

import { equals } from 'ramda';

import { useUpdateAllHelloMessagesMutation } from '../../data/services/hello-messages-api';
import { RootState } from '../../data/store';
import { useSnackbar } from '../../hooks/useSnackbar';
import { PanelSubmit } from '../panel-submit';

export const chatHelloMessages = createSelector(
  (state: RootState) => state.helloMessages,
  ({ currentMessages, updatedMessages }) => {
    const realDiff = updatedMessages.filter(({ message }) => !!message);
    const modified = !equals(currentMessages, realDiff);

    return {
      modified,
      updatedMessages,
    };
  }
);

export const HelloMessagesSubmit: FC = () => {
  const snackbar = useSnackbar();

  const { updatedMessages, modified } = useSelector(chatHelloMessages);
  const [submit, { data }] = useUpdateAllHelloMessagesMutation();

  useEffect(() => {
    if (data) {
      snackbar({
        message: 'Приветcтвенные сообщения были изменены',
        before: <Icon24ErrorCircle fill="var(--vkui--color_icon_accent)" />,
      });
    }
  }, [data, snackbar]);

  return (
    <PanelSubmit modified={modified} onSubmit={() => submit(updatedMessages)} />
  );
};
