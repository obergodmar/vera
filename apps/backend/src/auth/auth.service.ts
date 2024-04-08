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
  private readonly appId: number;
  private readonly serviceKey: string;
  private readonly logger: DebugService;

  public constructor(
    @Inject(LoggerService) loggerService: LoggerService,
    @Inject(VkApiService) private readonly vkApi: VkApiService,
    @Inject(ConfigService) config: ConfigService,
  ) {
    this.logger = new DebugService(loggerService, this.constructor.name);

    this.appId = config.get<IEnvironment['appId']>('appId');
    this.serviceKey = config.get<IEnvironment['serviceKey']>('serviceKey');
  }

  public async authorize(
    authorizeDto: AuthDto,
    req: Request,
  ): Promise<IApi.IAuthApi.AuthResponse> {
    const { sessionStore, session } = req;
    const { token, uuid, user } = authorizeDto.data;

    this.logger.log(
      `Auth request from id ${user.id} ${user.first_name} ${user.last_name}`,
    );

    let result: { response: { access_token: string } };
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

      const userResponse = await this.vkApi.fetchWithUserToken('users.get', {
        access_token: userToken,
      });
      const user = userResponse[0];
      if (!user) {
        throw new Error('User not found');
      }

      const createdSession = sessionStore.createSession(req, {
        cookie: session.cookie,
        user,
        token: result.response.access_token,
      });

      this.logger.debug(`Session created with id = ${createdSession.id}`);
    } catch (err: unknown) {
      this.logger.error(`Authorization error: ${err}`);

      return { token: '', error: 'Ошибка авторизации' };
    }
    this.logger.debug('Authenticated successfully');

    return {
      success: true,
      token: result.response.access_token,
    };
  }
}
