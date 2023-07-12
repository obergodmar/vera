import { IDuty, isTimeToNextDay } from '@vera-reforged/common';
import {
  Avatar,
  Button,
  Div,
  Group,
  RichCell,
  useAdaptivityWithJSMediaQueries,
} from '@vkontakte/vkui';

import { FC, HTMLAttributes, PropsWithChildren } from 'react';
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
    <Group>
      <RichCell
        disabled
        subhead={duties?.length ? `Дежурства ${nameWhen}` : undefined}
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
            key={`${duty.userId}-shift-${idx}`}
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
  const { isDesktop } = useAdaptivityWithJSMediaQueries();

  if (!firstName || !lastName) {
    return null;
  }

  const nextDay = isTimeToNextDay(timeFrom, timeTo);
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

  const withDutyWord = isDesktop ? 'дежурит ' : '';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '4px 0',
        gap: '5px',
      }}
    >
      C <Highlight>{timeFrom || '00:00'}</Highlight> до{' '}
      <Highlight>{timeTo || '23:59'}</Highlight>{' '}
      {nextDay ? 'следующего дня ' : ''}
      {withDutyWord}
      <Highlight
        style={{
          maxWidth: '100%',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
          verticalAlign: 'bottom',
        }}
      >
        {firstName} {lastName}
      </Highlight>
      {withTag}
    </div>
  );
};

const Highlight: FC<PropsWithChildren<HTMLAttributes<HTMLSpanElement>>> = ({
  children,
  style,
  ...props
}) => (
  <span
    style={{
      display: 'inline-block',
      padding: '1px 2px',
      borderBottom: '1px solid var(--vkui--color_stroke_accent)',
      ...style,
    }}
    {...props}
  >
    {children}
  </span>
);
