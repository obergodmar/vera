import { IDuty } from '@vera-reforged/common';
import { Spinner } from '@vkontakte/vkui';

import { FC, memo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { setCurrentSchedule } from '../../data/reducers/duty';
import {
  useGetMembersForChatQuery,
  useGetScheduleForChatQuery,
} from '../../data/services/duty-api';
import { RootState } from '../../data/store';
import { ChatMembersProvider } from '../../hooks/useChatMembers';
import { Day } from './day';

type Props = {
  chatId: number;
};

const days: IDuty.Day[] = [
  {
    shortName: 'пн',
    name: 'понедельник',
    nameWhen: 'в понедельник',
    dayNumber: 1,
  },
  {
    shortName: 'вт',
    name: 'вторник',
    nameWhen: 'во вторник',
    dayNumber: 2,
  },
  {
    shortName: 'ср',
    name: 'среда',
    nameWhen: 'в среду',
    dayNumber: 3,
  },
  {
    shortName: 'чт',
    name: 'четверг',
    nameWhen: 'в четверг',
    dayNumber: 4,
  },
  {
    shortName: 'пт',
    name: 'пятница',
    nameWhen: 'в пятницу',
    dayNumber: 5,
  },
];

export const Days: FC<Props> = memo(({ chatId }) => {
  const dispatch = useDispatch();

  const { isLoading: isMembersLoading, data: members = [] } =
    useGetMembersForChatQuery(chatId);
  const { data: schedule, isFetching } = useGetScheduleForChatQuery(chatId);

  const duties = useSelector((state: RootState) => state.duty.schedule[chatId]);

  useEffect(() => {
    if (!isFetching && schedule?.length) {
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
