import {
  differenceInCalendarWeeks,
  differenceInWeeks,
  endOfWeek,
  getWeekOfMonth,
  isSameISOWeek,
  lastDayOfWeek,
  startOfWeek,
} from 'date-fns';
import { ru } from 'date-fns/locale';
import produce from 'immer';

import { ICrons } from './crons';
import { IDuty } from './duty';

export function addLeadingZero(num: number): string {
  return num >= 10 ? `${num}` : `0${num}`;
}

export function getTimeInMinutes(time: string) {
  const timeReg = /(?<hour>\d\d):(?<minute>\d\d)/;
  const { hour, minute } = timeReg.exec(time)?.groups || {};

  if (!hour || !minute) {
    return 0;
  }

  return parseInt(hour) * 60 + parseInt(minute);
}

export function isTimeToNextDay(timeFrom: string, timeTo: string): boolean {
  const timeFromInMinutes = getTimeInMinutes(timeFrom);
  const timeToInMinutes = getTimeInMinutes(timeTo);

  return timeToInMinutes <= timeFromInMinutes;
}

export function filterScheduleByChatAndTag(
  schedule: IDuty.Schedule[],
  chatId: number,
  tag: string | null,
): IDuty.Schedule[] {
  return schedule.filter((duty) => {
    const chatMatch = duty.chatId === chatId;
    const tagMatch = tag ? duty.tag === tag : duty.tag === '';

    return chatMatch && tagMatch;
  });
}

export function filterScheduleByDay(
  schedule: IDuty.Schedule[],
  dayNumber: number,
  currentTimeInMinutes: number,
): IDuty.Schedule[] {
  return schedule.filter((duty) => {
    const nextDay = isTimeToNextDay(duty.timeFrom, duty.timeTo);

    const timeStopInMinutes = getTimeInMinutes(duty.timeTo);

    if (nextDay) {
      return duty.dayNumber === dayNumber;
    }

    return (
      timeStopInMinutes > currentTimeInMinutes && duty.dayNumber === dayNumber
    );
  });
}

export function filterScheduleByDayAndTime(
  schedule: IDuty.Schedule[],
  dayNumber: number,
  currentTimeInMinutes: number,
): IDuty.Schedule[] {
  return schedule.filter((duty) => {
    const nextDay = isTimeToNextDay(duty.timeFrom, duty.timeTo);

    const timeStartInMinutes = getTimeInMinutes(duty.timeFrom);
    const timeStopInMinutes = getTimeInMinutes(duty.timeTo);

    if (!nextDay && dayNumber === duty.dayNumber) {
      return (
        timeStartInMinutes < currentTimeInMinutes &&
        currentTimeInMinutes < timeStopInMinutes
      );
    }

    if (nextDay) {
      if (dayNumber === duty.dayNumber) {
        return currentTimeInMinutes > timeStartInMinutes;
      }

      if (dayNumber - 1 === duty.dayNumber) {
        return currentTimeInMinutes < timeStopInMinutes;
      }
    }

    return false;
  });
}

export function getDayMonthTime() {
  const date = new Date();

  const dayNumber = date.getDay();

  const hours = date.getHours();
  const minutes = date.getMinutes();

  const day = date.getDate();
  const month = date.getMonth() + 1;

  return {
    dayNumber,
    hours,
    minutes,
    day,
    month,
  };
}

export function getNextDayMonth() {
  const date = new Date();
  const tomorrow = new Date(date);
  tomorrow.setDate(date.getDate() + 1);

  const day = tomorrow.getDate();
  const month = tomorrow.getMonth() + 1;

  return {
    day,
    month,
  };
}

export function getDutyMessage(
  schedule: IDuty.Schedule[],
  mention = true,
): string {
  return schedule.reduce(
    (acc, { firstName, lastName, timeFrom, timeTo, tag, userId }) => {
      const withTimeFrom = timeFrom ? ` с ${timeFrom}` : '';
      const withTimeTo = timeTo ? ` до ${timeTo}` : '';
      const withTag = tag ? `#${tag} ` : '';

      const withPrev = acc ? `${acc}\n` : '';

      const { day, month } = getDayMonthTime();
      const { day: tomorrowDay, month: tomorrowMonth } = getNextDayMonth();

      const withDayMonthFrom = `${addLeadingZero(day)}.${addLeadingZero(
        month,
      )}`;
      const withDayMonthTo = isTimeToNextDay(timeFrom, timeTo)
        ? `${addLeadingZero(tomorrowDay)}.${addLeadingZero(tomorrowMonth)}`
        : withDayMonthFrom;

      const dutyName = mention
        ? `@id${userId} (${firstName})`
        : `${firstName} ${lastName}`;

      return `${withPrev}${withTag}${dutyName}${withTimeFrom} ${withDayMonthFrom}${withTimeTo} ${withDayMonthTo}`;
    },
    '',
  );
}

export function getAnnounceDutyMessage(
  schedule: IDuty.Schedule[],
  tag: string | null,
  noDutyAtCurrentTime: boolean,
) {
  const sortedSchedule = produce(schedule, (draft) => {
    draft.sort((a, b) => {
      const timeA = getTimeInMinutes(a.timeFrom);
      const timeB = getTimeInMinutes(b.timeFrom);

      return timeA - timeB;
    });
  });

  const withTag = tag ? `#${tag} ` : '';
  const noDutyMessage = `${withTag}Нет дежурств в данное время`;

  let message;

  if (sortedSchedule.length === 0) {
    message = noDutyMessage;
  } else if (noDutyAtCurrentTime) {
    const nextDutiesMessage = getDutyMessage(sortedSchedule, false);
    message = `${noDutyMessage}\n\nДежурства сегодня:\n${nextDutiesMessage}`;
  } else {
    message = getDutyMessage(sortedSchedule);
  }

  return message;
}

export function filterIds(omit: number[]) {
  return function (id: number): boolean {
    return !omit.includes(id);
  };
}

export function getDaysRange(days: number[]): string {
  const sorted = [...days].sort();

  return sorted.reduce((acc: string, day, idx) => {
    const prevDay = days[idx - 1];
    const nextDay = days[idx + 1];
    const prevSign = acc[acc.length - 1];
    if (!prevDay) {
      return `${day}`;
    }

    if (day === prevDay + 1 && day === nextDay - 1 && idx !== days.length - 1) {
      if (prevSign === '-') {
        return acc;
      }

      return `${acc}-`;
    }

    if (prevSign === '-') {
      return `${acc}${day}`;
    }

    return `${acc},${day}`;
  }, '');
}

export function getDaysArray(daysRange: string): number[] {
  return daysRange.split(',').reduce((acc: number[], item) => {
    if (!item.includes('-')) {
      acc.push(Number(item));

      return acc;
    }

    const [min, max] = item.split('-').map((i) => Number(i));

    if (!min || !max) {
      return acc;
    }

    acc.push(...[...Array(max - min + 1).keys()].map((i) => i + min));

    return acc;
  }, []);
}

export const capitalize = (str: string): string =>
  str.charAt(0).toUpperCase() + str.slice(1);

const oddWeeks = [1, 3, 5, 6];
const evenWeeks = [2, 4, 6];

const repeatPerWeek = [
  [],
  oddWeeks,
  evenWeeks,
  oddWeeks,
  evenWeeks,
  oddWeeks,
  oddWeeks,
];

const dateFNSConfig = {
  weekStartsOn: 1,
  locale: ru,
} as const;

export function shouldCallCron(
  startDate: ICrons.ChatCron['startDate'],
  currentDate: number,
  repeat: ICrons.ChatCron['repeat'],
): boolean {
  const startWeekOfMonth = getWeekOfMonth(
    lastDayOfWeek(startDate, dateFNSConfig),
    dateFNSConfig,
  );
  const currWeekOfMonth = getWeekOfMonth(currentDate, dateFNSConfig);

  const weeksDiff = Math.abs(
    differenceInWeeks(
      endOfWeek(startDate, dateFNSConfig),
      startOfWeek(currentDate, dateFNSConfig),
    ),
  );
  const isSameWeek = isSameISOWeek(startDate, currentDate);

  if (isSameWeek) {
    return true;
  }

  switch (repeat) {
    // Каждую неделю
    case 0:
      return true;
    // Раз в месяц
    case 1:
      return startWeekOfMonth === currWeekOfMonth;
    // Через неделю
    case 2:
      return repeatPerWeek[startWeekOfMonth].includes(currWeekOfMonth);
    // Через две недели
    case 3: {
      const margin = Math.floor(weeksDiff / 3) - 1;
      const diff = weeksDiff - (weeksDiff > 3 ? (margin > 0 ? margin : 1) : 0);

      return diff > 0 && diff % 2 === 0;
    }

    default:
      return true;
  }
}

export function generateRandomString(): string {
  const characters =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-';
  const minLength = 43;
  const maxLength = 128;
  const length =
    Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;

  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }

  return result;
}

export function getRandomElement<T>(array: T[]): T {
  if (!Array.isArray(array) || array.length === 0) {
    throw new Error('Array must be a non-empty array');
  }

  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}
