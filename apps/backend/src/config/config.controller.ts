import { Controller, Inject, Post } from '@nestjs/common';
import { ROUTES } from '@vera-reforged/common';

import { ConfigService } from './config.service';

@Controller(ROUTES.config.prefix)
export class ConfigController {
  public constructor(
    @Inject(ConfigService) private readonly config: ConfigService
  ) {}
  @Post('getConfig')
  public getConfig() {
    return this.config.getConfig();
  }
}
