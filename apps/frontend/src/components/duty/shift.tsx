import { IDuty } from '@vera-reforged/common';
import { Icon16Hashtag } from '@vkontakte/icons';
import { FormItem, Input } from '@vkontakte/vkui';

import { FC } from 'react';

import { Member } from '../../data/services/api';
import { useChatMembers } from '../../hooks/useChatMembers';
import { TimePicker } from '../time-picker';
import { MemberPicker } from './member-picker';

type Props = {
  duty: IDuty.Duty;
  title: string;
};

export const Shift: FC<Props> = ({ duty, title }) => {
  const members = useChatMembers();

  const dutyMember: Member = {
    value: duty.peerId,
    label: `${duty.firstName} ${duty.lastName}`,
    ...duty,
  };

  const { timeTo, timeFrom, tag } = duty;

  return (
    <FormItem top={title}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
        }}
      >
        <Input
          style={{ maxWidth: '75px' }}
          before={<Icon16Hashtag />}
          value={tag}
        />
        <div
          style={{
            flexGrow: 1,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          c <TimePicker value={timeFrom} /> по
          <TimePicker value={timeTo} />
        </div>
        <MemberPicker duties={[dutyMember]} members={members} />
      </div>
    </FormItem>
  );
};
