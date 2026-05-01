import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { IEnvironment } from '../environments/env-type';

export interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  my_chat_member?: TelegramChatMemberUpdated;
}

export interface TelegramMessage {
  message_id: number;
  from?: { id: number; is_bot: boolean; first_name: string; username?: string };
  chat: { id: number; type: string; title?: string };
  date: number;
  text?: string;
  new_chat_members?: { id: number; is_bot: boolean; first_name: string }[];
}

export interface TelegramChatMemberUpdated {
  chat: { id: number; type: string };
  from: { id: number };
  new_chat_member: { user: { id: number }; status: string };
}

export interface TelegramSendOptions {
  replyToMessageId?: number;
}

@Injectable()
export class TelegramApiService {
  private readonly logger = new Logger(TelegramApiService.name);
  private readonly baseUrl: string;
  private readonly enabled: boolean;

  public constructor(
    @Inject(ConfigService) private readonly config: ConfigService,
  ) {
    const token =
      this.config.get<IEnvironment['telegramBotToken']>('telegramBotToken');
    this.enabled =
      this.config.get<IEnvironment['telegramEnabled']>('telegramEnabled') ??
      false;
    this.baseUrl = `https://api.telegram.org/bot${token}`;
  }

  public get isEnabled(): boolean {
    return this.enabled;
  }

  public async call<T>(
    method: string,
    params?: Record<string, unknown>,
  ): Promise<T> {
    const url = `${this.baseUrl}/${method}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params ?? {}),
    });

    if (!res.ok) {
      throw new Error(
        `Telegram API error: ${res.status} ${res.statusText} for ${method}`,
      );
    }

    const data = (await res.json()) as {
      ok: boolean;
      result: T;
      description?: string;
    };

    if (!data.ok) {
      throw new Error(
        `Telegram API returned ok=false for ${method}: ${data.description}`,
      );
    }

    return data.result;
  }

  public async getUpdates(
    offset?: number,
    timeout = 25,
  ): Promise<TelegramUpdate[]> {
    return this.call<TelegramUpdate[]>('getUpdates', {
      ...(offset !== undefined ? { offset } : {}),
      timeout,
      allowed_updates: ['message', 'my_chat_member'],
    });
  }

  public async sendMessage(
    chatId: number | string,
    text: string,
    opts?: TelegramSendOptions,
  ): Promise<void> {
    try {
      await this.call('sendMessage', {
        chat_id: chatId,
        text,
        ...(opts?.replyToMessageId
          ? { reply_to_message_id: opts.replyToMessageId }
          : {}),
      });
    } catch (e) {
      this.logger.error(`sendMessage to ${chatId}: ${e}`);
    }
  }
}
