export type Config = {
  duties: {
    chats: number[];
    schedule: Record<number, Duties>;
  };
};

export type DutyChip = {
  value: number;
  label: string;
  avatar: string;
  username: string;
};

export type Day = {
  name: string;
  value: number;
  checked: boolean;
  time?: string;
};

export type Duties = {
  duties: DutyChip[];
  days: Day[];
};
