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

  export type Schedule = Record<number, any>;
}
