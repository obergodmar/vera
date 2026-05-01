import {
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createLog, getRandomId, sleep } from '@vera-reforged/common';

import { BotEventBusService } from '../bot-core/bot-event-bus.service';
import { IEnvironment } from '../environments/env-type';
import { logFS } from '../logger/log-fs';
import { VkApiService } from '../vk-api/vk-api.service';

const POLL_TIMEOUT = 25;
const ERROR_RETRY_DELAY = 5_000;

@Injectable()
export class VkPollingService
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private readonly logger = new Logger(VkPollingService.name);
  private readonly groupId: number;
  private readonly debugChatId: number;
  private readonly errorChatId: number;
  private shouldRun = true;

  public constructor(
    @Inject(VkApiService) private readonly vkApi: VkApiService,
    @Inject(ConfigService) private readonly config: ConfigService,
    @Inject(BotEventBusService)
    private readonly botEventBus: BotEventBusService,
  ) {
    this.groupId =
      this.config.get<IEnvironment['botPollingGroupId']>('botPollingGroupId');
    this.debugChatId =
      this.config.get<IEnvironment['debugChatId']>('debugChatId');
    this.errorChatId =
      this.config.get<IEnvironment['errorChatId']>('errorChatId');
  }

  public onApplicationBootstrap(): void {
    const launchMessage = 'VkPollingService: VK bot polling started';
    const logMsg = createLog(launchMessage, { type: 'log' });
    logFS(logMsg);
    this.logger.log(launchMessage);

    this.vkApi
      .fetch(
        'messages.send',
        {
          peer_id: this.debugChatId,
          message: logMsg,
          random_id: getRandomId(),
          group_id: 1,
        },
        { retries: 3 },
      )
      .catch((e) => this.logger.error(`Could not send launch message: ${e}`));

    this.runPollingLoop().catch((e) => {
      const errorMsg = `VkPollingService: fatal polling error, ${e}`;
      const logError = createLog(errorMsg, { type: 'error' });
      logFS(logError);
      this.logger.error(errorMsg);

      this.vkApi
        .fetch(
          'messages.send',
          {
            peer_id: this.errorChatId,
            message: logError,
            random_id: getRandomId(),
            group_id: 1,
          },
          { retries: 3 },
        )
        .catch(() => undefined);
    });
  }

  public onApplicationShutdown(): void {
    this.shouldRun = false;
  }

  private async runPollingLoop(): Promise<void> {
    let server: string;
    let key: string;
    let ts: string;

    ({ server, key, ts } = await this.getLongPollServer());

    while (this.shouldRun) {
      try {
        const url = `${server}?act=a_check&key=${encodeURIComponent(key)}&ts=${encodeURIComponent(ts)}&wait=${POLL_TIMEOUT}`;
        const res = await fetch(url);

        if (!res.ok) {
          this.logger.warn(`Long poll HTTP error: ${res.status}`);
          await sleep(ERROR_RETRY_DELAY);
          continue;
        }

        const data: {
          ts?: string;
          failed?: number;
          updates?: { type: string; object: Record<string, unknown> }[];
        } = await res.json();

        if (data.failed) {
          if (data.failed === 1 && data.ts) {
            ts = data.ts;
          } else {
            ({ server, key, ts } = await this.getLongPollServer());
          }
          continue;
        }

        if (data.ts) {
          ts = data.ts;
        }

        for (const update of data.updates ?? []) {
          this.processUpdate(update).catch((e) =>
            this.logger.error(`processUpdate error: ${e}`),
          );
        }
      } catch (e) {
        this.logger.error(`Long poll loop error: ${e}`);
        await sleep(ERROR_RETRY_DELAY);
      }
    }
  }

  private async getLongPollServer(): Promise<{
    server: string;
    key: string;
    ts: string;
  }> {
    return this.vkApi.fetch(
      'groups.getLongPollServer',
      { group_id: this.groupId },
      { retries: 5 },
    );
  }

  private async processUpdate(update: {
    type: string;
    object: Record<string, unknown>;
  }): Promise<void> {
    if (update.type !== 'message_new') {
      return;
    }

    const message = update.object['message'] as
      | Record<string, unknown>
      | undefined;
    if (!message) {
      return;
    }

    const action = message['action'] as
      | { type: string; member_id: number }
      | undefined;

    if (
      action?.type === 'chat_invite_user' ||
      action?.type === 'chat_invite_user_by_link'
    ) {
      await this.botEventBus.emitInvite({
        peerId: message['peer_id'] as number,
        memberId: action.member_id,
        backend: 'vk',
      });
    } else {
      await this.botEventBus.emitMessage({
        peerId: message['peer_id'] as number,
        fromId: message['from_id'] as number,
        text: (message['text'] as string) || null,
        conversationMessageId: message['conversation_message_id'] as number,
        backend: 'vk',
      });
    }
  }
}
