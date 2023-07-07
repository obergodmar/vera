import produce from 'immer';
import { MessagesConversation } from 'vk-io/lib/api/schemas/objects';

import { IDuty } from './duty';

export function addLeadingZero(num: number): string {
  return num > 10 ? `${num}` : `0${num}`;
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
  tag: string | null
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
  currentTimeInMinutes: number
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
  currentTimeInMinutes: number
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
  mention = true
): string {
  return schedule.reduce(
    (acc, { firstName, lastName, timeFrom, timeTo, tag, peerId }) => {
      const withTimeFrom = timeFrom ? ` с ${timeFrom}` : '';
      const withTimeTo = timeTo ? ` до ${timeTo}` : '';
      const withTag = tag ? `#${tag} ` : '';

      const withPrev = acc ? `${acc}\n` : '';

      const { day, month } = getDayMonthTime();
      const { day: tomorrowDay, month: tomorrowMonth } = getNextDayMonth();

      const withDayMonthFrom = `${addLeadingZero(day)}.${addLeadingZero(
        month
      )}`;
      const withDayMonthTo = isTimeToNextDay(timeFrom, timeTo)
        ? `${addLeadingZero(tomorrowDay)}.${addLeadingZero(tomorrowMonth)}`
        : withDayMonthFrom;

      const dutyName = mention
        ? `@id${peerId} (${firstName})`
        : `${firstName} ${lastName}`;

      return `${withPrev}${withTag}${dutyName}${withTimeFrom} ${withDayMonthFrom}${withTimeTo} ${withDayMonthTo}`;
    },
    ''
  );
}

export function getAnnounceDutyMessage(
  schedule: IDuty.Schedule[],
  tag: string | null,
  noDutyAtCurrentTime: boolean
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

export function isGroupChat(peerType?: string): boolean {
  const GROUPS_CHATS = ['chat', 'group'];

  return GROUPS_CHATS.includes(peerType || '');
}

export function filterByGroupChat(
  convos?: MessagesConversation[]
): MessagesConversation[] {
  if (!convos?.length) {
    return [];
  }

  return convos.filter((convo) => {
    if ('peer' in convo) {
      return isGroupChat(convo['peer']?.type);
    }

    return false;
  });
}
