import { Spinner } from '@vkontakte/vkui';

import { FC, memo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { setCurrentSchedule } from '../../data/reducers/duty';
import {
  useGetDutyMembersForChatQuery,
  useGetDutyScheduleForChatQuery,
} from '../../data/services/duty-api';
import { RootState } from '../../data/store';
import { ChatMembersProvider } from '../../hooks/useChatMembers';
import { Day } from './day';

type Props = {
  peerId: number;
};

export const Days: FC<Props> = memo(({ peerId }) => {
  const dispatch = useDispatch();

  const { isLoading: isMembersLoading, data: members = [] } =
    useGetDutyMembersForChatQuery(peerId);
  const { data: schedule, isFetching } = useGetDutyScheduleForChatQuery(peerId);

  const days = useSelector((state: RootState) => state.duty.days);
  const duties = useSelector((state: RootState) => state.duty.schedule[peerId]);

  useEffect(() => {
    if (!isFetching && schedule) {
      dispatch(setCurrentSchedule(schedule));
    }
  }, [dispatch, isFetching, schedule]);

  if (isMembersLoading || isFetching) {
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
