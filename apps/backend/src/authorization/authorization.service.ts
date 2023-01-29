import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Config } from '@vera-reforged/common';

import { compare } from 'bcrypt';

import { AuthorizeDto } from './dto/authorize.dto';

@Injectable()
export class AuthorizationService {
  public async authorize(authorizeDto: AuthorizeDto) {
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
      throw new HttpException(
        {
          error: 'Проблема на сервере',
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    if (!match) {
      throw new HttpException(
        {
          error: 'Неверный пароль',
        },
        HttpStatus.UNAUTHORIZED
      );
    }

    const token = '123';
    const config = (await import('../assets/config.json')) as Config;

    return {
      token,
      config,
    };
  }
}
