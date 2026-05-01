import {
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { sleep } from '@vera-reforged/common';

import { BotEventBusService } from '../bot-core/bot-event-bus.service';
import {
  TelegramApiService,
  TelegramUpdate,
} from '../bot-core/telegram-api.service';

const ERROR_RETRY_DELAY = 5_000;

@Injectable()
export class TelegramPollingService
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private readonly logger = new Logger(TelegramPollingService.name);
  private shouldRun = true;
  private offset: number | undefined;

  public constructor(
    @Inject(TelegramApiService)
    private readonly telegramApi: TelegramApiService,
    @Inject(BotEventBusService)
    private readonly botEventBus: BotEventBusService,
  ) {}

  public onApplicationBootstrap(): void {
    if (!this.telegramApi.isEnabled) {
      this.logger.log('Telegram polling is disabled (telegramEnabled=false)');
      return;
    }

    this.logger.log('Telegram polling started');
    this.runPollingLoop().catch((e) => {
      this.logger.error(`Telegram polling fatal error: ${e}`);
    });
  }

  public onApplicationShutdown(): void {
    this.shouldRun = false;
  }

  private async runPollingLoop(): Promise<void> {
    while (this.shouldRun) {
      try {
        const updates = await this.telegramApi.getUpdates(this.offset);

        for (const update of updates) {
          await this.processUpdate(update);
          this.offset = update.update_id + 1;
        }
      } catch (e) {
        this.logger.error(`Telegram polling loop error: ${e}`);
        await sleep(ERROR_RETRY_DELAY);
      }
    }
  }

  private async processUpdate(update: TelegramUpdate): Promise<void> {
    if (update.my_chat_member) {
      const { chat, from, new_chat_member } = update.my_chat_member;
      if (
        new_chat_member.status === 'member' ||
        new_chat_member.status === 'administrator'
      ) {
        await this.botEventBus.emitInvite({
          peerId: chat.id,
          memberId: from.id,
          backend: 'telegram',
        });
      }
      return;
    }

    if (update.message) {
      const { message } = update;

      if (message.new_chat_members && message.new_chat_members.length > 0) {
        for (const member of message.new_chat_members) {
          await this.botEventBus.emitInvite({
            peerId: message.chat.id,
            memberId: member.id,
            backend: 'telegram',
          });
        }
        return;
      }

      await this.botEventBus.emitMessage({
        peerId: message.chat.id,
        fromId: message.from?.id ?? 0,
        text: message.text ?? null,
        conversationMessageId: message.message_id,
        backend: 'telegram',
      });
    }
  }
}
