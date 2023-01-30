import { Inject, Injectable } from '@nestjs/common';

import { BotService } from '../bot/bot.service';
import { getConfig } from '../utils/getConfig';

@Injectable()
export class DutyService {
  public constructor(
    @Inject(BotService) private readonly botService: BotService
  ) {
    this.botService.bot.hear(/duty/, (msg: any) => {
      const currentDuty = getDuty(msg.peerId);

      let message = 'duty отсутствует';

      if (currentDuty) {
        const { username, label } = currentDuty;

        const [firstName] = label.split(' ');
        const date = new Date();
        let month: string | number = date.getMonth() + 1;
        month = month > 10 ? month : `0${month}`;

        const day = date.getDate();

        const tomorrow = new Date(date);
        tomorrow.setDate(day + 1);
        let tomorrowMonth: string | number = tomorrow.getMonth() + 1;
        tomorrowMonth =
          tomorrowMonth > 10 ? tomorrowMonth : `0${tomorrowMonth}`;

        const tomorrowDay = tomorrow.getDate();

        message = `@${username} (${firstName}) c 00:00 ${day}.${month} до 00:00 ${tomorrowDay}.${tomorrowMonth}.`;
      }

      this.botService.vk.api.messages.send({
        peer_id: msg.peerId,
        message,
        random_id: 0,
      });

      this.botService.vk.api.messages.send({
        peer_id: 900033,
        message: `Айди беседы, где запросили duty ${msg.peerId}`,
        random_id: 0,
      });
    });
  }
}

function getDuty(peerId: number) {
  const day = new Date().getDay();
  const config = getConfig();
  const { duties: dutiesSchedule } = config;

  const schedule = dutiesSchedule.schedule[peerId];

  if (!schedule) {
    return undefined;
  }

  const { duties, days } = schedule;
  const workingDays = days.filter(({ checked }) => checked);
  const workingDuties = duties
    .slice(0, workingDays.length)
    .map((item, idx) => ({
      ...item,
      dayNumber: workingDays[idx].value,
    }));

  return workingDuties.find(({ dayNumber }) => dayNumber === day);
}
