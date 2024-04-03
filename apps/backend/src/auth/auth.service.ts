import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { BotService } from '../bot/bot.service';
import { IEnvironment } from '../environments/env-type';
import { DebugService } from '../logger/debug.service';
import { LoggerService } from '../logger/logger.service';
import { AuthDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  private readonly appId: number;
  private readonly token: string
  private readonly serviceKey: string;
  private readonly logger: DebugService;

  public constructor(
    @Inject(BotService) private readonly botService: BotService,
    @Inject(LoggerService) loggerService: LoggerService,
    @Inject(ConfigService) config: ConfigService,
  ) {
    this.logger = new DebugService(loggerService, this.constructor.name);

    this.appId = config.get<IEnvironment['appId']>('appId');
    this.serviceKey = config.get<IEnvironment['serviceKey']>('serviceKey');
    this.token = config.get<IEnvironment['authorizationToken']>('authorizationToken');
  }

  public async authorize(authorizeDto: AuthDto) {
    const { token, uuid, user } = authorizeDto.data;

    this.logger.log(
      `Auth request from id ${user.id} ${user.first_name} ${user.last_name}`,
    );

    const params = `app_id=${this.appId}&access_token=${encodeURIComponent(
      this.serviceKey,
    )}&v=5.191&token=${encodeURIComponent(token)}&uuid=${encodeURIComponent(
      uuid,
    )}`;

    console.log(params);

    try {
      const result = await fetch(
        'https://api.vk.com/method/auth.exchangeSilentAuthToken?' + params,
        {
          method: 'POST',
        },
      ).then((res) => res.json());

      console.log(result);
    } catch (err: unknown) {
      console.error(err);
    }

    this.logger.debug('Authenticated successfully');

    return {
      token: this.token,
    };
  }
}

// function doAuthorize(req, res) {
//   console.log(req);
//
//   const { token, uuid, user } = req.body;
//
//   const params = `app_id=${APP_ID}&access_token=${encodeURIComponent(
//     SERVICE_KEY,
//   )}&v=5.191&token=${encodeURIComponent(token)}&uuid=${encodeURIComponent(
//     uuid,
//   )}`;
//
//   fetch('https://api.vk.com/method/auth.exchangeSilentAuthToken?' + params, {
//     method: 'POST',
//   })
//     .then((res) => res.json())
//     .then(async (result) => {
//       const accessToken = result.response && result.response.access_token;
//       const isPartialToken = result.response && result.response.is_partial;
//       if (!accessToken) {
//         console.log('Silent token exchanging error.', result.error);
//       }
//       res.setHeader('Content-Type', 'application/json');
//       let userProfile;
//       if (user) {
//         userProfile = await getUsersGetUser(accessToken);
//         console.log('User is: ', JSON.stringify(userProfile));
//       }
//       res.send(
//         JSON.stringify({
//           superapp_token: makeSuperAppToken(accessToken),
//           superapp_token_v2: makeSuperAppToken2(
//             accessToken,
//             'superappkit-web',
//             { scope: ['messenger'] },
//           ),
//           is_partial: isPartialToken,
//           user: userProfile,
//         }),
//       );
//     })
//     .catch(console.error);
// }
