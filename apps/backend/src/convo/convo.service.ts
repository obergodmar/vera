import { Inject, Injectable } from '@nestjs/common';
import { BotChatList, BotChatMembers } from '@vera-reforged/common';

import { Request } from 'express';
import { SessionData } from 'express-session';

import { BOT_PLATFORM_TOKEN, IBotPlatform } from '../bot-platform/IBotPlatform';
import { DebugService } from '../logger/debug.service';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class ConvoService {
  private readonly logger: DebugService;

  public constructor(
    @Inject(BOT_PLATFORM_TOKEN) private readonly bot: IBotPlatform,
    @Inject(LoggerService) loggerService: LoggerService,
  ) {
    this.logger = new DebugService(loggerService, this.constructor.name);
  }

  public async getChats(req: Request): Promise<BotChatList> {
    const { sessionStore, session } = req;

    let userId: number;
    try {
      const sessionData = await new Promise<SessionData>((resolve, reject) => {
        sessionStore.get(session.id, (err, existingSession) => {
          if (err) return reject(err);
          if (!existingSession) return reject('Session was not found');
          return resolve(existingSession);
        });
      });
      userId = (sessionData.user as { id: number }).id;
    } catch (error) {
      this.logger.error(error);
      sessionStore.destroy(session.id, (err) => {
        this.logger.error(`Could not destroy session: ${err}`);
      });
      return { count: 0, items: [] };
    }

    this.logger.debug('Vera chats requested');

    try {
      return await this.bot.getChats(userId);
    } catch (error: unknown) {
      this.logger.error(`getChats: ${error}`);
      return { count: 0, items: [] };
    }
  }

  public async getMembersForChat(chatId: number): Promise<BotChatMembers> {
    try {
      return await this.bot.getChatMembers(chatId);
    } catch (error: unknown) {
      this.logger.error(`getMembersForChat: ${error}`);
      return { count: 0, items: [] };
    }
  }
}
