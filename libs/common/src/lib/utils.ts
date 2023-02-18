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
