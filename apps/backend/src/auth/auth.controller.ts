import { Body, Controller, HttpCode, Inject, Post } from '@nestjs/common';
import { ROUTES } from '@vera-reforged/common';

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
  public async authorize(@Body() authorizeDto: AuthDto) {
    return this.authService.authorize(authorizeDto);
  }
}
