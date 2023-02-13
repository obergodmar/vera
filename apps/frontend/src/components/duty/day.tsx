import { IDuty } from '@vera-reforged/common';
import { Avatar, FormItem, Group, RichCell } from '@vkontakte/vkui';

import { FC } from 'react';

import { Shift } from './shift';

type Props = {
  day: IDuty.Day;
  duties: IDuty.Duty[];
};

export const Day: FC<Props> = ({ day, duties }) => {
  const { name, nameWhen, shortName } = day;

  return (
    <Group>
      <FormItem>
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

        {duties.map((duty, idx) => (
          <Shift key={duty.peerId} duty={duty} title={`Смена ${idx + 1}`} />
        ))}
      </FormItem>
    </Group>
  );
};
