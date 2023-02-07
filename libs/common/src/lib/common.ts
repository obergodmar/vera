export type Config = {
  duties: {
    chats: number[];
    schedulesPerChat: SchedulesPerChat;
  };
};

export type Duty = {
  peerId: number;
  name: string;
  avatar: string;
  screenName: string;
  time: string;
  hashtag?: string;
};

export type SchedulesPerChat = Record<number, SchedulePerChat>;
export type SchedulePerChat = {
  dayNumber: number;
  enabled: boolean;
  duties: Duty[];
};

export type Day = {
  shortName: string;
  name: string;
  dayNumber: number;
  enabled: boolean;
};

export type SchedulePerChatWithDays = SchedulePerChat & Day;
export type SchedulesPerChatWithDays = Record<number, SchedulePerChatWithDays>;

export const initialDays: Day[] = [
  {
    shortName: 'пн',
    name: 'понедельник',
    dayNumber: 1,
    enabled: false,
  },
  {
    shortName: 'вт',
    name: 'вторник',
    dayNumber: 2,
    enabled: false,
  },
  {
    shortName: 'ср',
    name: 'среда',
    dayNumber: 3,
    enabled: false,
  },
  {
    shortName: 'чт',
    name: 'четверг',
    dayNumber: 4,
    enabled: false,
  },
  {
    shortName: 'пт',
    name: 'пятница',
    dayNumber: 5,
    enabled: false,
  },
];
