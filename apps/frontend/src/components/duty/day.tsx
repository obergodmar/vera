import { IDuty } from '@vera-reforged/common';
import { Avatar, Button, FormItem, Group, RichCell } from '@vkontakte/vkui';

import { FC, useState } from 'react';

import { Shift } from './shift';

type Props = {
  day: IDuty.Day;
  duties: IDuty.Duty[];
};

export const Day: FC<Props> = ({ day, duties }) => {
  const [shifts, setShifts] = useState(duties.length || 1);

  const { name, nameWhen, shortName, dayNumber } = day;

  return (
    <Group>
      <RichCell
        style={{ padding: '0' }}
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
        {[...Array(shifts).keys()].map((value, idx) => (
          <Shift
            key={value}
            duty={duties[value]}
            shiftNumber={value}
            dayNumber={dayNumber}
          />
        ))}

        <Button
          mode="outline"
          appearance="neutral"
          onClick={() => setShifts((prev) => ++prev)}
        >
          Добавить смену
        </Button>
      </div>
    </Group>
  );
};
