import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';

import { compare } from 'bcrypt';

import { DebugService } from '../logger/debug.service';
import { LoggerService } from '../logger/logger.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class LoginService {
  private readonly logger: DebugService;

  public constructor(@Inject(LoggerService) loggerService: LoggerService) {
    this.logger = new DebugService(loggerService, this.constructor.name);
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
      match = await compare(
        password,
        'REMOVED_PASSWORD_HASH',
      );
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
      token: 'REMOVED_AUTH_TOKEN',
    };
  }
}
