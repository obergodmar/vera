import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BotUser, IApi } from '@vera-reforged/common';

import { Request } from 'express';

import { BOT_PLATFORM_TOKEN, IBotPlatform } from '../bot-platform/IBotPlatform';
import { IEnvironment } from '../environments/env-type';
import { DebugService } from '../logger/debug.service';
import { LoggerService } from '../logger/logger.service';
import { AuthDto } from './dto/auth.dto';

declare module 'express-session' {
  interface SessionData {
    user: BotUser;
    token: string;
  }
}

@Injectable()
export class AuthService {
  private readonly logger: DebugService;
  private readonly accessChatId: number;

  public constructor(
    @Inject(LoggerService) loggerService: LoggerService,
    @Inject(BOT_PLATFORM_TOKEN) private readonly bot: IBotPlatform,
    @Inject(ConfigService) config: ConfigService,
  ) {
    this.logger = new DebugService(loggerService, this.constructor.name);
    this.accessChatId =
      config.get<IEnvironment['accessChatId']>('accessChatId');
  }

  public async authorize(
    authorizeDto: AuthDto,
    req: Request,
  ): Promise<IApi.IAuthApi.AuthResponse> {
    const { sessionStore, session } = req;

    let visitor = 'unknown user';
    try {
      const result = await this.bot.authorizeUser(authorizeDto.data);
      if (!result) {
        throw new Error('Authorization failed');
      }

      const { user, token } = result;
      visitor = `${user.firstName}${user.lastName ? ' ' + user.lastName : ''} (id=${user.id})`;
      this.logger.auth(`Auth attempt from ${visitor}`);

      const hasAccess = await this.bot.isMember(this.accessChatId, user.id);
      if (!hasAccess) {
        throw new Error(`Visitor ${visitor} was not found in access chat`);
      }

      sessionStore.createSession(req, {
        cookie: session.cookie,
        user,
        token,
      });

      this.logger.debug(`Session created for ${visitor}`);
      this.logger.auth(`Auth for ${visitor} was successful`);

      return { success: true, token, user };
    } catch (err: unknown) {
      this.logger.auth(`Error: ${visitor} - ${err}`);
      return {
        token: '',
        user: null,
        error: 'Отсутствует доступ к панели управления',
      };
    }
  }
}
