import { IConfig } from '@vera-reforged/common';

export const initialConfig: IConfig.IConfig = {
  duty: {
    chats: [],
    days: [
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
    ],
    schedule: {},
  },
};
