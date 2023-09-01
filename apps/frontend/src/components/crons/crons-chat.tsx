import { getDaysRange } from '@vera-reforged/common';
import { Icon24ErrorCircle } from '@vkontakte/icons';
import {
  Button,
  FormItem,
  FormLayout,
  FormLayoutGroup,
  Group,
  Header,
} from '@vkontakte/vkui';

import { FC, ReactNode, useEffect, useState } from 'react';

import { useCreateCronForChatMutation } from '../../data/services/crons-api';
import { useSnackbar } from '../../hooks/useSnackbar';
import { CronEditing } from './cron-editing';

type Props = {
  chatId: number;
  chatTitle: string | ReactNode;
};

export const CronsChat: FC<Props> = ({ chatTitle, chatId }) => {
  const [submit, { data, isLoading, reset }] = useCreateCronForChatMutation();
  const snackbar = useSnackbar();

  const [days, setDays] = useState<number[]>([]);
  const [time, setTime] = useState<string>('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (data?.success) {
      snackbar({
        message: 'Крон создан',
        before: <Icon24ErrorCircle fill="var(--vkui--color_icon_accent)" />,
      });

      setDays([]);
      setTime('');
      setMessage('');
    }
  }, [data, snackbar]);

  useEffect(() => reset);

  return (
    <Group mode="plain">
      <Header>Создание нового крона</Header>
      <FormLayout>
        <FormLayoutGroup mode="vertical">
          <CronEditing
            time={time}
            setTime={setTime}
            message={message}
            setMessage={setMessage}
            days={days}
            setDays={setDays}
            chatTitle={chatTitle}
          />

          <FormItem>
            <Button
              stretched
              disabled={!time || !days.length || !message}
              loading={isLoading}
              onClick={() =>
                submit({
                  message,
                  timeAt: time,
                  daysRange: getDaysRange(days),
                  chatId,
                  enabled: true,
                })
              }
            >
              Создать крон
            </Button>
          </FormItem>
        </FormLayoutGroup>
      </FormLayout>
    </Group>
  );
};
