import { Body, Controller, HttpCode, Inject, Post, Req } from '@nestjs/common';
import { IApi, ROUTES } from '@vera-reforged/common';

import { Request } from 'express';

import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';

const { prefix, endpoints } = ROUTES.auth;

@Controller(prefix)
export class AuthController {
  public constructor(
    @Inject(AuthService)
    private readonly authService: AuthService,
  ) {}

  @Post(endpoints.authorize)
  @HttpCode(200)
  public async authorize(
    @Body() authorizeDto: AuthDto,
    @Req() req: Request,
  ): Promise<IApi.IAuthApi.AuthResponse> {
    return this.authService.authorize(authorizeDto, req);
  }
}
