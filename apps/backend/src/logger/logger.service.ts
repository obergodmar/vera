import { Inject, Injectable } from '@nestjs/common';
import { createLog, VIM } from '@vera-reforged/common';

import { BotService } from '../bot/bot.service';

@Injectable()
export class LoggerService {
  public constructor(@Inject(BotService) private readonly bot: BotService) {}

  public log(
    value: unknown,
    { type }: { type: 'log' | 'error' } = { type: 'log' }
  ) {
    this.bot.vk.api.messages.send({
      peer_id: VIM,
      message: createLog(value, { type }),
      random_id: 0,
    });
  }
}
