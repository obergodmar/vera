import { Controller, Inject, Param, Post } from '@nestjs/common';
import { ROUTES } from '@vera-reforged/common';

import { DutyService } from './duty.service';

@Controller(ROUTES.duty.prefix)
export class DutyController {
  public constructor(
    @Inject(DutyService) private readonly dutyService: DutyService
  ) {}

  @Post('getChats')
  public getChats() {
    return this.dutyService.getChats();
  }

  @Post('getMembersForChat/:chatId')
  public getMembersForChat(@Param('chatId') chatId: number) {
    return this.dutyService.getMembersForChat(chatId);
  }

  @Post('getConfig')
  public getConfig() {
    return this.dutyService.getConfig();
  }
}
