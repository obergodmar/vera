import { Injectable } from '@nestjs/common';

import { IBotInviteEvent, IBotMessageEvent } from './bot-event.types';

@Injectable()
export class BotEventBusService {
  private readonly messageHandlers: ((
    event: IBotMessageEvent,
  ) => Promise<void>)[] = [];

  private readonly inviteHandlers: ((
    event: IBotInviteEvent,
  ) => Promise<void>)[] = [];

  public onMessage(handler: (event: IBotMessageEvent) => Promise<void>): void {
    this.messageHandlers.push(handler);
  }

  public onInvite(handler: (event: IBotInviteEvent) => Promise<void>): void {
    this.inviteHandlers.push(handler);
  }

  public async emitMessage(event: IBotMessageEvent): Promise<void> {
    for (const handler of this.messageHandlers) {
      await handler(event);
    }
  }

  public async emitInvite(event: IBotInviteEvent): Promise<void> {
    for (const handler of this.inviteHandlers) {
      await handler(event);
    }
  }
}
