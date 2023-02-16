import { Spinner } from '@vkontakte/vkui';

import { FC, memo } from 'react';
import { useSelector } from 'react-redux';

import { useGetDutyMembersForChatQuery } from '../../data/services/duty-api';
import { RootState } from '../../data/store';
import { ChatMembersProvider } from '../../hooks/useChatMembers';
import { Day } from './day';

type Props = {
  peerId: number;
};

export const Days: FC<Props> = memo(({ peerId }) => {
  const { isLoading, data: members } = useGetDutyMembersForChatQuery(peerId);
  const days = useSelector((state: RootState) => state.duty.days);
  const duties = useSelector((state: RootState) => state.duty.schedule[peerId]);

  if (isLoading || !members) {
    return <Spinner />;
  }

  return (
    <ChatMembersProvider members={members}>
      {days.map((day) => {
        return (
          <Day
            key={day.dayNumber}
            day={day}
            duties={
              duties?.filter(({ dayNumber }) => dayNumber === day.dayNumber) ||
              []
            }
          />
        );
      })}
    </ChatMembersProvider>
  );
});
