import {
  Config,
  initialDays,
  SchedulePerChat,
  SchedulePerChatWithDays,
  SchedulesPerChatWithDays,
} from '@vera-reforged/common';

export function toDutiesState(config: Config): SchedulesPerChatWithDays {
  const {
    duties: { schedulesPerChat },
  } = config;

  return Object.entries(schedulesPerChat).reduce(
    (acc: SchedulesPerChatWithDays, [chatIdString, value]) => {
      const chatId = Number(chatIdString);
      acc[chatId] = toFullDays(value);

      return acc;
    },
    {}
  );
}

export function toFullDays(schedule: SchedulePerChat): SchedulePerChatWithDays {
  const dayParams = initialDays.find(
    ({ dayNumber }) => dayNumber === schedule.dayNumber
  );

  if (!dayParams) {
    return {
      ...initialDays[0],
      ...schedule,
    };
  }

  return {
    ...schedule,
    ...dayParams,
  };
}
