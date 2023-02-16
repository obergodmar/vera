import { IDuty } from '@vera-reforged/common';
import { Avatar, Button, Div, Group, RichCell } from '@vkontakte/vkui';

import { FC } from 'react';
import { useDispatch } from 'react-redux';

import { createShift } from '../../data/reducers/duty';
import { Shift } from './shift';

type Props = {
  day: IDuty.Day;
  duties: IDuty.Duty[];
};

export const Day: FC<Props> = ({ day, duties }) => {
  const dispatch = useDispatch();

  const { name, nameWhen, shortName, dayNumber } = day;

  return (
    <Group>
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
        {duties?.length ? 'тест' : `Дежурства ${nameWhen} отсутствуют`}
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
