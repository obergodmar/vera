import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { compare, hash } from 'bcrypt';

import { IEnvironment } from '../environments/env-type';
import { DebugService } from '../logger/debug.service';
import { LoggerService } from '../logger/logger.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class LoginService {
  private readonly token: string;
  private readonly hash: string;
  private readonly logger: DebugService;

  public constructor(
    @Inject(LoggerService) loggerService: LoggerService,
    @Inject(ConfigService) config: ConfigService,
  ) {
    this.logger = new DebugService(loggerService, this.constructor.name);

    this.token =
      config.get<IEnvironment['authorizationToken']>('authorizationToken');
    this.hash =
      config.get<IEnvironment['authorizationHash']>('authorizationHash');
  }

  public async authorize(authorizeDto: LoginDto) {
    const { password } = authorizeDto;

    if (!password) {
      throw new HttpException(
        {
          error: 'Пустой пароль',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    let match = false;

    try {
      match = await compare(password, this.hash);
    } catch (e) {
      this.logger.debug("Couldn't compare password by hash");

      throw new HttpException(
        {
          error: 'Проблема на сервере',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    if (!match) {
      this.logger.debug("Couldn't authenticate: wrong password");

      throw new HttpException(
        {
          error: 'Неверный пароль',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    this.logger.debug('Authenticated successfully');

    return {
      token: this.token,
    };
  }
}
