import { Body, Controller, Inject, Post } from '@nestjs/common';

import { AuthorizationService } from './authorization.service';
import { AuthorizeDto } from './dto/authorize.dto';

@Controller('login')
export class AuthorizationController {
  public constructor(
    @Inject(AuthorizationService)
    private readonly authorizationService: AuthorizationService
  ) {}

  @Post()
  public async index(@Body() authorizeDto: AuthorizeDto) {
    return this.authorizationService.authorize(authorizeDto);
  }
}
