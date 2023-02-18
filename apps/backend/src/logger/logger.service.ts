import { Inject, Injectable } from '@nestjs/common';
import { addLeadingZero } from '@vera-reforged/common';

import { createWriteStream } from 'node:fs';
import { homedir } from 'node:os';

import { BotService } from '../bot/bot.service';

const filePath = `${homedir()}/vera-log.txt`;

@Injectable()
export class LoggerService {
  private readonly exampleUserTwo = 900033;

  public constructor(@Inject(BotService) private readonly bot: BotService) {}

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

    this.bot.vk.api.messages.send({
      peer_id: this.exampleUserTwo,
      message: message,
      random_id: 0,
    });
  }
}
