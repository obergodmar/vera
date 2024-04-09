import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IApi } from '@vera-reforged/common';
import { UsersUser } from '@example/api-schema-typescript';

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

  private readonly appId: number;
  private readonly serviceKey: string;

  private readonly accessChatId: number;

  public constructor(
    @Inject(LoggerService) loggerService: LoggerService,
    @Inject(VkApiService) private readonly vkApi: VkApiService,
    @Inject(ConfigService) config: ConfigService,
  ) {
    this.logger = new DebugService(loggerService, this.constructor.name);

    this.appId = config.get<IEnvironment['appId']>('appId');
    this.serviceKey = config.get<IEnvironment['serviceKey']>('serviceKey');

    this.accessChatId =
      config.get<IEnvironment['accessChatId']>('accessChatId');
  }

  public async authorize(
    authorizeDto: AuthDto,
    req: Request,
  ): Promise<IApi.IAuthApi.AuthResponse> {
    const { sessionStore, session } = req;
    const { token, uuid, user } = authorizeDto.data;

    const visitor = `@id${user.id} (${user.first_name} ${user.last_name})`;

    this.logger.auth(`Auth attempt from ${visitor}`);

    let result: { response: { access_token: string } };
    let requestedUser: UsersUser;
    try {
      result = await request(
        'https://api.vk.com/method/auth.exchangeSilentAuthToken?v=5.191',
        {
          app_id: this.appId,
          access_token: this.serviceKey,
          token,
          uuid,
        },
      );

      const userToken = result.response.access_token;

      const userResponse = await this.vkApi.fetchWithUserToken(
        'users.get',
        {
          access_token: userToken,
        },
        { retries: 3 },
      );
      requestedUser = userResponse[0];
      if (!requestedUser) {
        throw new Error('User not found');
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
        chatMembers.items.find(
          ({ member_id: memberId }) => memberId === requestedUser.id,
        )
      ) {
        const createdSession = sessionStore.createSession(req, {
          cookie: session.cookie,
          user: requestedUser,
          token: result.response.access_token,
        });

        this.logger.debug(`Session created with id = ${createdSession.id}`);
      } else {
        throw new Error(`Visitor ${visitor} was not found in access chat`);
      }
    } catch (err: unknown) {
      this.logger.auth(`Error: ${visitor} - ${err}`);

      return { token: '', user: null, error: 'Ошибка авторизации' };
    }

    this.logger.auth(`Auth for ${visitor} was successful`);

    return {
      success: true,
      token: result.response.access_token,
      user: requestedUser,
    };
  }
}
