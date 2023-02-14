import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ROUTES } from '@vera-reforged/common';

import { LoginDto } from './dto/login.dto';
import { LoginService } from './login.service';

@Controller(ROUTES.login.prefix)
export class LoginController {
  public constructor(
    @Inject(LoginService)
    private readonly authorizationService: LoginService
  ) {}

  @Post()
  public async index(@Body() authorizeDto: LoginDto) {
    return this.authorizationService.authorize(authorizeDto);
  }
}
