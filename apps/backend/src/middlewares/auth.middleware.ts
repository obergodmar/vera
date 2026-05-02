import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { NextFunction, Request, Response } from 'express';
import { SessionData } from 'express-session';

import { BOT_PLATFORM_TOKEN, IBotPlatform } from '../bot-platform/IBotPlatform';
import { IEnvironment } from '../environments/env-type';
import { DebugService } from '../logger/debug.service';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private readonly logger: DebugService;
  private readonly accessChatId: number;

  public constructor(
    @Inject(BOT_PLATFORM_TOKEN) private readonly bot: IBotPlatform,
    @Inject(LoggerService) loggerService: LoggerService,
    @Inject(ConfigService) config: ConfigService,
  ) {
    this.logger = new DebugService(loggerService, this.constructor.name);
    this.accessChatId =
      config.get<IEnvironment['accessChatId']>('accessChatId');
  }

  async use(req: Request, res: Response, next: NextFunction) {
    const { body, session, sessionStore } = req;

    try {
      const { user: savedUser, token } = await new Promise<SessionData>(
        (resolve, reject) => {
          sessionStore.get(session.id, (err, existingSession) => {
            if (err) return reject(err);
            if (!existingSession) return reject('Session was not found');
            return resolve(existingSession);
          });
        },
      );

      if (body.token !== token) {
        throw new Error('Data mismatched');
      }

      const userId = (savedUser as { id: number }).id;

      if (!(await this.bot.validateToken(token, userId))) {
        throw new Error('Invalid token');
      }

      if (!(await this.bot.isMember(this.accessChatId, userId))) {
        throw new Error('User is not in access chat');
      }
    } catch (error: unknown) {
      res.status(401).send({ error: 'Сессия устарела' });
      sessionStore.destroy(session.id);

      this.logger.debug(`${error}`);

      return;
    }

    next();
  }
}
