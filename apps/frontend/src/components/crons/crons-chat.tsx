import { getDaysRange,ICrons } from '@vera-reforged/common';
import {
  Icon20AddCircleOutline,
  Icon20RemoveCircleOutline,
  Icon24ErrorCircle,
} from '@vkontakte/icons';
import {
  Avatar,
  Button,
  FormItem,
  FormLayout,
  FormLayoutGroup,
  Group,
  Header,
  Text,
  Textarea,
} from '@vkontakte/vkui';

import { FC, Fragment, ReactNode, useEffect, useState } from 'react';

import { useCreateCronForChatMutation } from '../../data/services/crons-api';
import { useSnackbar } from '../../hooks/useSnackbar';
import { TimePicker } from '../time-picker';

type Props = {
  chatId: number;
  chatTitle: string | ReactNode;
};

const daysNames: ICrons.Day[] = [
  {
    shortName: 'пн',
    name: 'понедельник',
    nameWhen: 'понедельник',
    dayNumber: 1,
  },
  {
    shortName: 'вт',
    name: 'вторник',
    nameWhen: 'вторник',
    dayNumber: 2,
  },
  {
    shortName: 'ср',
    name: 'среда',
    nameWhen: 'среду',
    dayNumber: 3,
  },
  {
    shortName: 'чт',
    name: 'четверг',
    nameWhen: 'четверг',
    dayNumber: 4,
  },
  {
    shortName: 'пт',
    name: 'пятница',
    nameWhen: 'пятницу',
    dayNumber: 5,
  },
];

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
          <FormItem top="Время">
            <TimePicker
              value={time}
              onChange={(value) => {
                setTime(value as string);
              }}
            />
          </FormItem>
          <FormItem top="Дни недели">
            <div style={{ display: 'flex', gap: '10px' }}>
              {daysNames.map(({ name, nameWhen, dayNumber, shortName }) => (
                <Avatar
                  key={dayNumber}
                  initials={shortName}
                  size={40}
                  gradientColor={days.includes(dayNumber) ? 'blue' : undefined}
                  onClick={() =>
                    setDays((prev) => {
                      if (prev.includes(dayNumber)) {
                        return prev.filter((id) => id !== dayNumber);
                      } else {
                        return [...prev, dayNumber].sort();
                      }
                    })
                  }
                >
                  <Avatar.Overlay theme="dark">
                    {days.includes(dayNumber) ? (
                      <Icon20RemoveCircleOutline />
                    ) : (
                      <Icon20AddCircleOutline />
                    )}
                  </Avatar.Overlay>
                </Avatar>
              ))}
            </div>
          </FormItem>

          <FormItem
            top={`Сообщение для "${chatTitle}"`}
            bottom={
              !!time && !!days.length ? (
                <>
                  Это сообщение будет отправляться каждый{' '}
                  {days.map((day) => {
                    const isBeforeLast = days.length - 1 === day;
                    const isLast = days.length === day;
                    return (
                      <Fragment key={day}>
                        <Text
                          style={{
                            display: 'inline',
                            color: 'var(--vkui--color_accent_blue)',
                            fontWeight: 'bold',
                            fontSize: 'inherit',
                          }}
                        >
                          {
                            daysNames.find(({ dayNumber }) => dayNumber === day)
                              ?.nameWhen
                          }
                        </Text>
                        {isLast ? ' ' : isBeforeLast ? ' и ' : ', '}
                      </Fragment>
                    );
                  })}{' '}
                  в{' '}
                  <Text
                    style={{
                      display: 'inline',
                      color: 'var(--vkui--color_accent_blue)',
                      fontWeight: 'bold',
                      fontSize: 'inherit',
                    }}
                  >
                    {time}
                  </Text>
                </>
              ) : undefined
            }
          >
            <Textarea
              placeholder={`Сообщение для чата "${chatTitle}"`}
              value={message}
              onChange={({ target: { value } }) => setMessage(value)}
            />
          </FormItem>

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

