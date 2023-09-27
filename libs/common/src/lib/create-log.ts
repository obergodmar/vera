import { addLeadingZero } from './utils';

type LogType = 'log' | 'error' | 'debug';

export function createLog(value: unknown, { type }: { type: LogType }): string {
  const date = new Date();

  const day = addLeadingZero(date.getDate());
  const month = addLeadingZero(date.getMonth() + 1);
  const year = addLeadingZero(date.getFullYear());

  const hours = addLeadingZero(date.getHours());
  const minutes = addLeadingZero(date.getMinutes());
  const seconds = addLeadingZero(date.getSeconds());

  let stringValues = '';
  if (typeof value === 'object') {
    try {
      stringValues = JSON.stringify(value);
    } catch {
      stringValues = `${value}`;
    }
  } else {
    stringValues = `${value}`;
  }

  const message = `[${type.toUpperCase()}] ${day}.${month}.${year} ${hours}:${minutes}:${seconds}  ${stringValues}`;

  return message;
}
