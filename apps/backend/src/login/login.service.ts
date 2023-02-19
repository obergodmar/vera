import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';

import { compare } from 'bcrypt';

import { LoggerService } from '../logger/logger.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class LoginService {
  public constructor(
    @Inject(LoggerService) private readonly logger: LoggerService
  ) {}

  public async authorize(authorizeDto: LoginDto) {
    const { password } = authorizeDto;

    if (!password) {
      throw new HttpException(
        {
          error: 'Пустой пароль',
        },
        HttpStatus.BAD_REQUEST
      );
    }

    let match = false;

    try {
      match = await compare(
        password,
        'REMOVED_PASSWORD_HASH'
      );
    } catch (e) {
      this.logger.log('LoginService: Не удалось проверить пароль по хэшу');

      throw new HttpException(
        {
          error: 'Проблема на сервере',
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    if (!match) {
      this.logger.log(
        'LoginService: Неудачная попытка авторизации: неверный пароль'
      );

      throw new HttpException(
        {
          error: 'Неверный пароль',
        },
        HttpStatus.UNAUTHORIZED
      );
    }

    this.logger.log('LoginService: Успешная авторизация');

    return {
      token: 'REMOVED_AUTH_TOKEN',
    };
  }
}
