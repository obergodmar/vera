export namespace IDuty {
  export interface IDuty {
    chats: number[];
    days: Day[];
    schedule: Schedule;
  }

  export type Day = {
    shortName: string;
    name: string;
    nameWhen: string;
    dayNumber: number;
  };

  /**
   * By ChatId
   */
  export type Schedule = Record<number, Duty[]>;
  export type Duty = {
    peerId: number;
    firstName: string;
    lastName: string;
    avatar: string;
    screenName: string;
    dayNumber: number | undefined;
    timeFrom: string;
    timeTo: string;
    tag?: string;
  };
}
