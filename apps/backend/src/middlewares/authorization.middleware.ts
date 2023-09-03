import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { NextFunction, Request, Response } from 'express';

import { IEnvironment } from '../environments/env-type';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class AuthorizationMiddleware implements NestMiddleware {
  public constructor(
    @Inject(ConfigService) private readonly config: ConfigService,
    @Inject(LoggerService) private readonly logger: LoggerService
  ) {}

  use(req: Request, res: Response, next: NextFunction) {
    const authorizationToken =
      this.config.get<IEnvironment['authorizationToken']>('authorizationToken');
    if (!authorizationToken) {
      throw Error('AUTHORIZATION_TOKEN is empty');
    }

    const { body } = req;

    if (body?.token !== authorizationToken) {
      this.logger.log('AuthorizationMiddleware: Token is missing or invalid', {
        type: 'error',
      });

      res.status(401).send('Токен авторизации пуст или невалиден');

      return;
    }

    next();
  }
}
