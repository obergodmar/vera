import { Injectable } from '@nestjs/common';

import { createWriteStream } from 'node:fs';
import { homedir } from 'node:os';

const filePath = `${homedir()}/vera-log.txt`;

@Injectable()
export class LoggerService {
  public log(
    value: unknown,
    { type }: { type: 'log' | 'error' } = { type: 'log' }
  ) {
    const date = new Date();

    const day = addLeadingZero(date.getDate());
    const month = addLeadingZero(date.getMonth() + 1);
    const year = addLeadingZero(date.getFullYear());

    const hours = addLeadingZero(date.getHours());
    const minutes = addLeadingZero(date.getMinutes());
    const seconds = addLeadingZero(date.getSeconds());

    const stringValues = value.toString();

    const message = `[${type.toUpperCase()}] ${day}.${month}.${year} ${hours}:${minutes}:${seconds}  ${stringValues}`;
    console.log(message);

    const stream = createWriteStream(filePath, { flags: 'a' });

    stream.write(message + '\n');
    stream.end();
  }
}

function addLeadingZero(num: number) {
  return num > 10 ? `${num}` : `0${num}`;
}
