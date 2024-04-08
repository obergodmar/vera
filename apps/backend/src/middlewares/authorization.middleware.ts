import { Inject, Injectable, NestMiddleware } from '@nestjs/common';

import { NextFunction, Request, Response } from 'express';
import { SessionData } from 'express-session';

import { DebugService } from '../logger/debug.service';
import { LoggerService } from '../logger/logger.service';
import { VkApiService } from '../vk-api/vk-api.service';

@Injectable()
export class AuthorizationMiddleware implements NestMiddleware {
  private readonly logger: DebugService;

  public constructor(
    @Inject(VkApiService) private readonly vkApi: VkApiService,
    @Inject(LoggerService) loggerService: LoggerService,
  ) {
    this.logger = new DebugService(loggerService, this.constructor.name);
  }

  async use(req: Request, res: Response, next: NextFunction) {
    const { body, session, sessionStore } = req;

    try {
      const userResponse = await this.vkApi.fetchWithUserToken('users.get', {
        access_token: body.token,
      });
      const user = userResponse[0];
      if (!user) {
        throw new Error('User not found');
      }

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

      if (savedUser.id !== user.id || body.token !== token) {
        throw new Error('Data missmatched');
      }
    } catch (error: unknown) {
      res.status(401).send({ error: 'Сессия устарела' });

      this.logger.debug(`Error: ${error}`);

      return;
    }

    next();
  }
}
