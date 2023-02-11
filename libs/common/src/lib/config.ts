import { IDuty } from './duty';

export namespace IConfig {
  export interface IConfig {
    duty: IDuty.IDuty;
  }
}

export type Config = {
  duties: {
    chats: number[];
    days: Day[];
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

export const initialDays: Day[] = [];
