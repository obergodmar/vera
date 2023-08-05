import { addLeadingZero } from './utils';

export const VIM = 900033;

export function createLog(
  value: unknown,
  { type }: { type: 'log' | 'error' } = { type: 'log' }
): string {
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

  console.log(message);

  return message;
}
