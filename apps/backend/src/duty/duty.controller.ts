import { Controller, Inject, Param, Post } from '@nestjs/common';
import { ROUTES } from '@vera-reforged/common';

import { DutyService } from './duty.service';

@Controller(ROUTES.duty.prefix)
export class DutyController {
  public constructor(
    @Inject(DutyService) private readonly dutyService: DutyService
  ) {}

  @Post('getDutyChats')
  public getDutyChats() {
    return this.dutyService.getDutyChats();
  }

  @Post('getDutyMembersForChat/:chatId')
  public getDutyMembersForChat(@Param('chatId') chatId: number) {
    return this.dutyService.getDutyMembersForChat(chatId);
  }
}
