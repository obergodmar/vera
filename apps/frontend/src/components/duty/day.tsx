import { IDuty } from '@vera-reforged/common';
import { Avatar, Button, Div, Group, RichCell } from '@vkontakte/vkui';

import { FC, PropsWithChildren } from 'react';
import { useDispatch } from 'react-redux';

import { createShift } from '../../data/reducers/duty';
import { Shift } from './shift';

type Props = {
  day: IDuty.Day;
  duties: IDuty.Schedule[];
};

export const Day: FC<Props> = ({ day, duties }) => {
  const dispatch = useDispatch();

  const { name, nameWhen, shortName, dayNumber } = day;

  return (
    <Group description="Для вызова дежурного(ых) без тега достаточно написать duty. Чтобы вызвать дежурного(ых) с определенным тегом необходимо вызвать duty <тег>">
      <RichCell
        disabled
        subhead="Результат"
        name={name}
        before={
          <Avatar
            initials={shortName}
            gradientColor={duties?.length ? 'blue' : undefined}
          />
        }
      >
        {duties?.length
          ? duties.map((duty, idx) => (
              <Result
                key={`${duty.firstName}_${duty.lastName}_${idx}`}
                {...duty}
              />
            ))
          : `Дежурства ${nameWhen} отсутствуют`}
      </RichCell>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          gap: '5px',
        }}
      >
        {duties.map((duty, idx) => (
          <Shift
            key={`${duty.peerId}-shift-${idx}`}
            duty={duty}
            shiftNumber={idx}
            dayNumber={dayNumber}
          />
        ))}

        <Div>
          <Button
            stretched
            mode="outline"
            appearance="neutral"
            onClick={() => dispatch(createShift({ dayNumber }))}
          >
            Добавить смену
          </Button>
        </Div>
      </div>
    </Group>
  );
};

const Result: FC<IDuty.Schedule> = ({
  firstName,
  lastName,
  timeFrom,
  timeTo,
  tag,
}) => {
  if (!firstName || !lastName) {
    return null;
  }

  const nextDay = isTillNextDay(timeFrom, timeTo);

  const withTag = tag ? (
    <span
      style={{
        display: 'inline-block',
        paddingLeft: '10px',
        color: 'var(--vkui--color_accent_blue)',
        fontWeight: 'bold',
      }}
    >
      #{tag}
    </span>
  ) : null;

  return (
    <div
      style={{
        padding: '4px 0',
      }}
    >
      C <Highlight>{timeFrom || '00:00'}</Highlight> до{' '}
      <Highlight>{timeTo || '23:59'}</Highlight>{' '}
      {nextDay ? 'следующего дня ' : ''}дежурит{' '}
      <Highlight>
        {firstName} {lastName}
      </Highlight>
      {withTag}
    </div>
  );
};

const Highlight: FC<PropsWithChildren> = ({ children }) => (
  <span
    style={{
      display: 'inline-block',
      padding: '1px 2px',
      borderBottom: '1px solid var(--vkui--color_stroke_accent)',
    }}
  >
    {children}
  </span>
);

function isTillNextDay(timeFrom: string, timeTo: string) {
  function getTimeInMinutes(time: string) {
    const timeReg = /(?<hour>\d\d):(?<minute>\d\d)/;
    const { hour, minute } = timeReg.exec(time)?.groups || {};

    if (!hour || !minute) {
      return 0;
    }

    return parseInt(hour) * 60 + parseInt(minute);
  }

  const timeFromInMinutes = getTimeInMinutes(timeFrom);
  const timeToInMinutes = getTimeInMinutes(timeTo);

  return timeToInMinutes <= timeFromInMinutes;
}
