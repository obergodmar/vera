import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { NextFunction, Request, Response } from 'express';
import { SessionData } from 'express-session';

import { IEnvironment } from '../environments/env-type';
import { DebugService } from '../logger/debug.service';
import { LoggerService } from '../logger/logger.service';
import { VkApiService } from '../vk-api/vk-api.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private readonly logger: DebugService;

  private readonly accessChatId: number;

  public constructor(
    @Inject(VkApiService) private readonly vkApi: VkApiService,
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
            if (err) {
              return reject(err);
            }

            if (!existingSession) {
              return reject('Session was not found');
            }

            return resolve(existingSession);
          });
        },
      );

      if (body.token !== token) {
        throw new Error('Data missmatched');
      }

      const userResponse = await this.vkApi.fetchWithUserToken('users.get', {
        access_token: body.token,
      });
      const user = userResponse[0];
      if (!user) {
        throw new Error('User not found');
      }

      if (savedUser.id !== user.id) {
        throw new Error('Data missmatched');
      }

      const chatMembers = await this.vkApi.fetch(
        'messages.getConversationMembers',
        {
          group_id: 1,
          peer_id: this.accessChatId,
          extended: 0,
        },
        {
          retries: 3,
        },
      );

      if (
        !chatMembers.items.find(
          ({ member_id: memberId }) => memberId === user.id,
        )
      ) {
        throw new Error('User is not in access chat');
      }

      // Update user profile
      // sessionStore.set(session.id, { token, user, cookie: session.cookie });
    } catch (error: unknown) {
      res.status(401).send({ error: 'Сессия устарела' });

      this.logger.debug(`${error}`);

      return;
    }

    next();
  }
}
