import { IConfig } from './config';
import { IDuty } from './duty';

export const getConfig = (): IConfig.IConfig => ({
  duty: {
    chats: [2000010050, 2000010041, 2000010048],
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
    schedule: [
      {
        chatId: 2000010050,
        dayNumber: 1,
        tag: 'web',
        timeTo: '23:59',
        timeFrom: '00:00',
        peerId: 900026,
        avatar:
          'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20rx%3D%2250%22%20fill%3D%22%23e5e7eb%22%2F%3E%3Ccircle%20cx%3D%2250%22%20cy%3D%2236%22%20r%3D%2218%22%20fill%3D%22%236b7280%22%2F%3E%3Cpath%20d%3D%22M18%2088a32%2032%200%200%201%2064%200%22%20fill%3D%22%236b7280%22%2F%3E%3C%2Fsvg%3E',
        firstName: 'TestOne',
        screenName: 'example_user_one',
        lastName: 'ExampleOne',
      },
      {
        chatId: 2000010050,
        dayNumber: 1,
        tag: 'qa',
        timeTo: '23:59',
        timeFrom: '00:00',
        peerId: 900033,
        avatar:
          'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20rx%3D%2250%22%20fill%3D%22%23e5e7eb%22%2F%3E%3Ccircle%20cx%3D%2250%22%20cy%3D%2236%22%20r%3D%2218%22%20fill%3D%22%236b7280%22%2F%3E%3Cpath%20d%3D%22M18%2088a32%2032%200%200%201%2064%200%22%20fill%3D%22%236b7280%22%2F%3E%3C%2Fsvg%3E',
        firstName: 'ТестДва',
        screenName: 'example_user_two',
        lastName: 'ПримерДва',
      },
      {
        chatId: 2000010050,
        dayNumber: 1,
        tag: 'asd',
        timeTo: '23:20',
        timeFrom: '23:45',
        peerId: 900011,
        avatar:
          'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20rx%3D%2250%22%20fill%3D%22%23e5e7eb%22%2F%3E%3Ccircle%20cx%3D%2250%22%20cy%3D%2236%22%20r%3D%2218%22%20fill%3D%22%236b7280%22%2F%3E%3Cpath%20d%3D%22M18%2088a32%2032%200%200%201%2064%200%22%20fill%3D%22%236b7280%22%2F%3E%3C%2Fsvg%3E',
        firstName: 'ТестТри',
        screenName: 'example_user_three',
        lastName: 'ПримерТри',
      },
      {
        chatId: 2000010050,
        dayNumber: 2,
        tag: 'web',
        timeTo: '23:59',
        timeFrom: '00:00',
        peerId: 900026,
        avatar:
          'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20rx%3D%2250%22%20fill%3D%22%23e5e7eb%22%2F%3E%3Ccircle%20cx%3D%2250%22%20cy%3D%2236%22%20r%3D%2218%22%20fill%3D%22%236b7280%22%2F%3E%3Cpath%20d%3D%22M18%2088a32%2032%200%200%201%2064%200%22%20fill%3D%22%236b7280%22%2F%3E%3C%2Fsvg%3E',
        firstName: 'TestOne',
        screenName: 'example_user_one',
        lastName: 'ExampleOne',
      },
      {
        chatId: 2000010050,
        dayNumber: 2,
        tag: 'duty',
        timeTo: '23:59',
        timeFrom: '00:00',
        peerId: 900033,
        avatar:
          'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20rx%3D%2250%22%20fill%3D%22%23e5e7eb%22%2F%3E%3Ccircle%20cx%3D%2250%22%20cy%3D%2236%22%20r%3D%2218%22%20fill%3D%22%236b7280%22%2F%3E%3Cpath%20d%3D%22M18%2088a32%2032%200%200%201%2064%200%22%20fill%3D%22%236b7280%22%2F%3E%3C%2Fsvg%3E',
        firstName: 'ТестДва',
        screenName: 'example_user_two',
        lastName: 'ПримерДва',
      },
    ],
  },
});

export const getDuty = (): IDuty.IDuty => getConfig().duty;
export const getSchedule = (): IDuty.Schedule[] => getDuty().schedule;

export const getScheduleResultForWeb = (): IDuty.Schedule[] => [
  {
    chatId: 2000010050,
    dayNumber: 1,
    tag: 'web',
    timeTo: '23:59',
    timeFrom: '00:00',
    peerId: 900026,
    avatar:
      'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20rx%3D%2250%22%20fill%3D%22%23e5e7eb%22%2F%3E%3Ccircle%20cx%3D%2250%22%20cy%3D%2236%22%20r%3D%2218%22%20fill%3D%22%236b7280%22%2F%3E%3Cpath%20d%3D%22M18%2088a32%2032%200%200%201%2064%200%22%20fill%3D%22%236b7280%22%2F%3E%3C%2Fsvg%3E',
    firstName: 'TestOne',
    screenName: 'example_user_one',
    lastName: 'ExampleOne',
  },
  {
    chatId: 2000010050,
    dayNumber: 2,
    tag: 'web',
    timeTo: '23:59',
    timeFrom: '00:00',
    peerId: 900026,
    avatar:
      'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20rx%3D%2250%22%20fill%3D%22%23e5e7eb%22%2F%3E%3Ccircle%20cx%3D%2250%22%20cy%3D%2236%22%20r%3D%2218%22%20fill%3D%22%236b7280%22%2F%3E%3Cpath%20d%3D%22M18%2088a32%2032%200%200%201%2064%200%22%20fill%3D%22%236b7280%22%2F%3E%3C%2Fsvg%3E',
    firstName: 'TestOne',
    screenName: 'example_user_one',
    lastName: 'ExampleOne',
  },
];

export const getScheduleResultForQa = (): IDuty.Schedule[] => [
  {
    chatId: 2000010050,
    dayNumber: 1,
    tag: 'qa',
    timeTo: '23:59',
    timeFrom: '00:00',
    peerId: 900033,
    avatar:
      'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20rx%3D%2250%22%20fill%3D%22%23e5e7eb%22%2F%3E%3Ccircle%20cx%3D%2250%22%20cy%3D%2236%22%20r%3D%2218%22%20fill%3D%22%236b7280%22%2F%3E%3Cpath%20d%3D%22M18%2088a32%2032%200%200%201%2064%200%22%20fill%3D%22%236b7280%22%2F%3E%3C%2Fsvg%3E',
    firstName: 'ТестДва',
    screenName: 'example_user_two',
    lastName: 'ПримерДва',
  },
];

export const getScheduleResultForAsd = (): IDuty.Schedule[] => [
  {
    chatId: 2000010050,
    dayNumber: 1,
    tag: 'asd',
    timeTo: '23:20',
    timeFrom: '23:45',
    peerId: 900011,
    avatar:
      'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20rx%3D%2250%22%20fill%3D%22%23e5e7eb%22%2F%3E%3Ccircle%20cx%3D%2250%22%20cy%3D%2236%22%20r%3D%2218%22%20fill%3D%22%236b7280%22%2F%3E%3Cpath%20d%3D%22M18%2088a32%2032%200%200%201%2064%200%22%20fill%3D%22%236b7280%22%2F%3E%3C%2Fsvg%3E',
    firstName: 'ТестТри',
    screenName: 'example_user_three',
    lastName: 'ПримерТри',
  },
];

export const getSingleScheduleWithoutTagSameDay = (): IDuty.Schedule[] => [
  {
    chatId: 2000010050,
    dayNumber: 1,
    tag: '',
    timeTo: '22:00',
    timeFrom: '15:00',
    peerId: 900033,
    avatar:
      'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20rx%3D%2250%22%20fill%3D%22%23e5e7eb%22%2F%3E%3Ccircle%20cx%3D%2250%22%20cy%3D%2236%22%20r%3D%2218%22%20fill%3D%22%236b7280%22%2F%3E%3Cpath%20d%3D%22M18%2088a32%2032%200%200%201%2064%200%22%20fill%3D%22%236b7280%22%2F%3E%3C%2Fsvg%3E',
    firstName: 'ТестДва',
    screenName: 'example_user_two',
    lastName: 'ПримерДва',
  },
];

export const getSingleScheduleWithoutTagNextDay = (): IDuty.Schedule[] => [
  {
    chatId: 2000010050,
    dayNumber: 1,
    tag: '',
    timeTo: '15:00',
    timeFrom: '22:00',
    peerId: 900033,
    avatar:
      'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20rx%3D%2250%22%20fill%3D%22%23e5e7eb%22%2F%3E%3Ccircle%20cx%3D%2250%22%20cy%3D%2236%22%20r%3D%2218%22%20fill%3D%22%236b7280%22%2F%3E%3Cpath%20d%3D%22M18%2088a32%2032%200%200%201%2064%200%22%20fill%3D%22%236b7280%22%2F%3E%3C%2Fsvg%3E',
    firstName: 'ТестДва',
    screenName: 'example_user_two',
    lastName: 'ПримерДва',
  },
];

export const getSingleScheduleWithTag = (): IDuty.Schedule[] => [
  {
    chatId: 2000010050,
    dayNumber: 1,
    tag: 'web',
    timeTo: '15:00',
    timeFrom: '22:00',
    peerId: 900033,
    avatar:
      'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20rx%3D%2250%22%20fill%3D%22%23e5e7eb%22%2F%3E%3Ccircle%20cx%3D%2250%22%20cy%3D%2236%22%20r%3D%2218%22%20fill%3D%22%236b7280%22%2F%3E%3Cpath%20d%3D%22M18%2088a32%2032%200%200%201%2064%200%22%20fill%3D%22%236b7280%22%2F%3E%3C%2Fsvg%3E',
    firstName: 'ТестДва',
    screenName: 'example_user_two',
    lastName: 'ПримерДва',
  },
];

export const getUnsortedSchedule = (): IDuty.Schedule[] => [
  {
    chatId: 2000010050,
    dayNumber: 1,
    tag: 'web',
    timeTo: '15:00',
    timeFrom: '22:00',
    peerId: 900033,
    avatar:
      'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20rx%3D%2250%22%20fill%3D%22%23e5e7eb%22%2F%3E%3Ccircle%20cx%3D%2250%22%20cy%3D%2236%22%20r%3D%2218%22%20fill%3D%22%236b7280%22%2F%3E%3Cpath%20d%3D%22M18%2088a32%2032%200%200%201%2064%200%22%20fill%3D%22%236b7280%22%2F%3E%3C%2Fsvg%3E',
    firstName: 'ТестДва',
    screenName: 'example_user_two',
    lastName: 'ПримерДва',
  },
  {
    chatId: 2000010050,
    dayNumber: 1,
    tag: 'web',
    timeTo: '23:20',
    timeFrom: '23:45',
    peerId: 900011,
    avatar:
      'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20rx%3D%2250%22%20fill%3D%22%23e5e7eb%22%2F%3E%3Ccircle%20cx%3D%2250%22%20cy%3D%2236%22%20r%3D%2218%22%20fill%3D%22%236b7280%22%2F%3E%3Cpath%20d%3D%22M18%2088a32%2032%200%200%201%2064%200%22%20fill%3D%22%236b7280%22%2F%3E%3C%2Fsvg%3E',
    firstName: 'ТестТри',
    screenName: 'example_user_three',
    lastName: 'ПримерТри',
  },
  {
    chatId: 2000010050,
    dayNumber: 1,
    tag: 'web',
    timeTo: '23:59',
    timeFrom: '00:00',
    peerId: 900026,
    avatar:
      'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20rx%3D%2250%22%20fill%3D%22%23e5e7eb%22%2F%3E%3Ccircle%20cx%3D%2250%22%20cy%3D%2236%22%20r%3D%2218%22%20fill%3D%22%236b7280%22%2F%3E%3Cpath%20d%3D%22M18%2088a32%2032%200%200%201%2064%200%22%20fill%3D%22%236b7280%22%2F%3E%3C%2Fsvg%3E',
    firstName: 'TestOne',
    screenName: 'example_user_one',
    lastName: 'ExampleOne',
  },
];

export const getScheduleWithDifferentTime = (): IDuty.Schedule[] => [
  {
    chatId: 2000010050,
    dayNumber: 1,
    tag: 'web',
    timeTo: '22:00',
    timeFrom: '15:00',
    peerId: 900033,
    avatar:
      'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20rx%3D%2250%22%20fill%3D%22%23e5e7eb%22%2F%3E%3Ccircle%20cx%3D%2250%22%20cy%3D%2236%22%20r%3D%2218%22%20fill%3D%22%236b7280%22%2F%3E%3Cpath%20d%3D%22M18%2088a32%2032%200%200%201%2064%200%22%20fill%3D%22%236b7280%22%2F%3E%3C%2Fsvg%3E',
    firstName: 'ТестДва',
    screenName: 'example_user_two',
    lastName: 'ПримерДва',
  },
  {
    chatId: 2000010050,
    dayNumber: 1,
    tag: 'web',
    timeTo: '23:45',
    timeFrom: '23:20',
    peerId: 900011,
    avatar:
      'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20rx%3D%2250%22%20fill%3D%22%23e5e7eb%22%2F%3E%3Ccircle%20cx%3D%2250%22%20cy%3D%2236%22%20r%3D%2218%22%20fill%3D%22%236b7280%22%2F%3E%3Cpath%20d%3D%22M18%2088a32%2032%200%200%201%2064%200%22%20fill%3D%22%236b7280%22%2F%3E%3C%2Fsvg%3E',
    firstName: 'ТестТри',
    screenName: 'example_user_three',
    lastName: 'ПримерТри',
  },
];
