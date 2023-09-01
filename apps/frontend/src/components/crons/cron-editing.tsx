import { ICrons } from '@vera-reforged/common';
import {
  Icon20AddCircleOutline,
  Icon20RemoveCircleOutline,
} from '@vkontakte/icons';
import { Avatar, FormItem, Text, Textarea } from '@vkontakte/vkui';

import { Dispatch, FC, Fragment, ReactNode, SetStateAction } from 'react';

import { TimePicker } from '../time-picker';

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

type Props = {
  time: string;
  setTime: Dispatch<SetStateAction<string>>;
  message: string;
  setMessage: Dispatch<SetStateAction<string>>;
  days: number[];
  setDays: Dispatch<SetStateAction<number[]>>;

  chatTitle: ReactNode;
};

export const CronEditing: FC<Props> = ({
  time,
  setTime,
  message,
  setMessage,
  days,
  setDays,
  chatTitle,
}) => {
  return (
    <>
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
          {daysNames.map(({ dayNumber, shortName }) => (
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
    </>
  );
};
