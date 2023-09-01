import { getDaysArray, getDaysRange, ICrons } from '@vera-reforged/common';
import { Icon24ErrorCircle } from '@vkontakte/icons';

import { FC, ReactNode, useEffect, useState } from 'react';

import { useUpdateCronForChatMutation } from '../../data/services/crons-api';
import { useConfirmation } from '../../hooks/useConfirmation';
import { useSnackbar } from '../../hooks/useSnackbar';
import { ModifiableCell } from '../modifiable-cell';
import { CronEditing } from './cron-editing';

type Props = ICrons.ChatCron & {
  chatTitle: ReactNode;
};

export const Cron: FC<Props> = ({
  id,
  chatId,
  timeAt,
  message,
  daysRange,
  enabled,
  chatTitle,
}) => {
  const { confirmed, setConfirmed, confirmationTimer } = useConfirmation(5);
  const [submit, { data, isLoading, reset }] = useUpdateCronForChatMutation();
  const snackbar = useSnackbar();

  const [currentTime, setCurrentTime] = useState(timeAt);
  const [currentMessage, setCurrentMessage] = useState(message);
  const [currentDays, setCurrentDays] = useState(getDaysArray(daysRange));
  const [currentEnabled, setCurrentEnabled] = useState(enabled);

  useEffect(() => {
    setCurrentTime(timeAt);
  }, [timeAt]);

  useEffect(() => {
    setCurrentMessage(message);
  }, [message]);

  useEffect(() => {
    setCurrentDays(getDaysArray(daysRange));
  }, [daysRange]);

  useEffect(() => {
    setCurrentEnabled(enabled);
  }, [enabled]);

  const modified =
    currentTime !== timeAt ||
    currentMessage !== message ||
    getDaysRange(currentDays) !== daysRange ||
    currentEnabled !== enabled;

  useEffect(() => {
    if (data?.success) {
      snackbar({
        message: 'Крон обновлен',
        before: <Icon24ErrorCircle fill="var(--vkui--color_icon_accent)" />,
      });
    }
  }, [data, snackbar]);

  useEffect(() => reset);

  return (
    <ModifiableCell
      modified={modified}
      subhead="Крон"
      enabled={currentEnabled}
      setEnabled={setCurrentEnabled}
      onSave={() => {
        submit({
          chatId,
          id,
          enabled: currentEnabled,
          message: currentMessage,
          daysRange: getDaysRange(currentDays),
          timeAt: currentTime,
        });
      }}
      onReset={() => {
        setCurrentEnabled(enabled);
        setCurrentMessage(message);
        setCurrentDays(getDaysArray(daysRange));
        setCurrentTime(timeAt);
      }}
      onRemove={() => {
        if (confirmed) {
          submit({
            chatId,
            id,
            daysRange: '',
            timeAt: '',
            message: '',
            enabled,
          });
        }

        setConfirmed(true);
      }}
      removeConfirmed={confirmed}
      confirmationTimer={confirmationTimer}
      isLoading={isLoading}
    >
      <CronEditing
        time={currentTime}
        setTime={setCurrentTime}
        message={currentMessage}
        setMessage={setCurrentMessage}
        days={currentDays}
        setDays={setCurrentDays}
        chatTitle={chatTitle}
      />
    </ModifiableCell>
  );
};
