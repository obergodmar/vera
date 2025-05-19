import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IApi } from '@vera-reforged/common';
import { UsersUser } from '@vkontakte/api-schema-typescript';

import { Request } from 'express';

import { IEnvironment } from '../environments/env-type';
import { DebugService } from '../logger/debug.service';
import { LoggerService } from '../logger/logger.service';
import { request } from '../vk-api/request';
import { VkApiService } from '../vk-api/vk-api.service';
import { AuthDto } from './dto/auth.dto';

declare module 'express-session' {
  interface SessionData {
    user: UsersUser;
    token: string;
  }
}

@Injectable()
export class AuthService {
  private readonly logger: DebugService;
  private readonly accessChatId: number;

  private readonly appId: IEnvironment['appId'];
  private readonly redirectUri: IEnvironment['redisUrl'];

  public constructor(
    @Inject(LoggerService) loggerService: LoggerService,
    @Inject(VkApiService) private readonly vkApi: VkApiService,
    @Inject(ConfigService) config: ConfigService,
  ) {
    this.logger = new DebugService(loggerService, this.constructor.name);
    this.accessChatId =
      config.get<IEnvironment['accessChatId']>('accessChatId');

    this.appId = config.get<IEnvironment['appId']>('appId');
    this.redirectUri = config.get<IEnvironment['redirectUri']>('redirectUri');
  }

  public async authorize(
    authorizeDto: AuthDto,
    req: Request,
  ): Promise<IApi.IAuthApi.AuthResponse> {
    const { sessionStore, session } = req;
    const { code, code_verifier, device_id } = authorizeDto.data;

    let accessToken = '';
    let visitor = 'unknown user';
    let requestedUser: UsersUser;
    try {
      const res = await request('https://id.vk.com/oauth2/auth', {
        client_id: this.appId,
        grant_type: 'authorization_code',
        code,
        redirect_uri: this.redirectUri,
        code_verifier,
        device_id,
      });

      accessToken = res.access_token;

      const userResponse = await this.vkApi.fetchWithUserToken(
        'users.get',
        {
          access_token: accessToken,
        },
        { retries: 3 },
      );
      requestedUser = userResponse[0];
      if (!requestedUser) {
        throw new Error('User not found');
      }

      visitor = `@id${requestedUser.id} (${requestedUser.first_name} ${requestedUser.last_name})`;
      this.logger.auth(`Auth attempt from ${visitor}`);

      const chatMembers = await this.vkApi.fetch(
        'messages.getConversationMembers',
        {
          group_id: 1,
          peer_id: this.accessChatId,
          // extended: 0,
        },
        {
          retries: 3,
        },
      );

      if (
        chatMembers.items.find(
          ({ member_id: memberId }) => memberId === requestedUser.id,
        )
      ) {
        const createdSession = sessionStore.createSession(req, {
          cookie: session.cookie,
          user: requestedUser,
          token: accessToken,
        });

        this.logger.debug(`Session created with id = ${createdSession.id}`);
      } else {
        throw new Error(`Visitor ${visitor} was not found in access chat`);
      }
    } catch (err: unknown) {
      this.logger.auth(`Error: ${visitor} - ${err}`);

      return {
        token: '',
        user: null,
        error: 'Отсутствует доступ к панели управления',
      };
    }

    this.logger.auth(`Auth for ${visitor} was successful`);

    return {
      success: true,
      token: accessToken,
      user: requestedUser,
    };
  }
}
