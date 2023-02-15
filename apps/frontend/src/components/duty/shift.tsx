import { IDuty } from '@vera-reforged/common';
import { Icon16Hashtag } from '@vkontakte/icons';
import { FormItem, Input } from '@vkontakte/vkui';

import { FC, useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { createShift, editShift } from '../../data/reducers/duty';
import { Member } from '../../data/services/duty-api';
import { useChatMembers } from '../../hooks/useChatMembers';
import { TimePicker } from '../time-picker';
import { MemberPicker } from './member-picker';

type Props = {
  duty: IDuty.Duty;
  shiftNumber: number;
  dayNumber: number;
};

export const Shift: FC<Props> = ({ duty, shiftNumber, dayNumber }) => {
  const members = useChatMembers();
  const dispatch = useDispatch();

  const dutyMember: Member = {
    value: duty.peerId,
    label: `${duty.firstName} ${duty.lastName}`,
    ...duty,
  };

  const { timeTo, timeFrom, tag } = duty;

  const handleCreateShift = useCallback(
    (members: Member[]) => {
      dispatch(createShift({ member: members[0], dayNumber }));
    },
    [dayNumber, dispatch]
  );

  const handleEditShift = (values: Partial<IDuty.Duty>) => {
    dispatch(editShift({ shiftNumber, shift: values }));
  };

  return (
    <FormItem top={`Смена ${shiftNumber + 1}`}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
        }}
      >
        <MemberPicker
          duties={[dutyMember]}
          members={members}
          onChange={handleCreateShift}
        />
        <div
          style={{
            flexGrow: 1,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          c{' '}
          <TimePicker
            value={timeFrom}
            onChange={(value) => {
              handleEditShift({ timeFrom: value as string });
            }}
          />{' '}
          по
          <TimePicker
            value={timeTo}
            onChange={(value) => {
              handleEditShift({ timeTo: value as string });
            }}
          />
        </div>
        <Input
          style={{ maxWidth: '75px' }}
          before={<Icon16Hashtag />}
          value={tag}
          onChange={({ target: { value } }) => handleEditShift({ tag: value })}
        />
      </div>
    </FormItem>
  );
};
