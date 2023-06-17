import { Body, Controller, Inject, Post } from '@nestjs/common';
import { IApi, ROUTES } from '@vera-reforged/common';

import {
  GetMembersFotChatDto,
  GetScheduleForChatDto,
  UpdateChatScheduleDto,
} from './duty.dto';
import { DutyService } from './duty.service';

@Controller(ROUTES.duty.prefix)
export class DutyController {
  public constructor(
    @Inject(DutyService) private readonly dutyService: DutyService
  ) {}

  @Post('getChats')
  public getChats(): Promise<IApi.IDutyApi.GetChatsResponse> {
    return this.dutyService.getChats();
  }

  @Post('getMembersForChat')
  public async getMembersForChat(
    @Body() data: GetMembersFotChatDto
  ): Promise<IApi.IDutyApi.GetMembersForChatResponse> {
    return this.dutyService.getMembersForChat(data.chatId);
  }

  @Post('getDays')
  public getDays(): IApi.IDutyApi.GetDaysResponse {
    return this.dutyService.getDays();
  }

  @Post('getSchedule')
  public getSchedule(): IApi.IDutyApi.GetScheduleResponse {
    return this.dutyService.getSchedule();
  }

  @Post('getScheduleForChat')
  public getScheduleForChat(
    @Body() data: GetScheduleForChatDto
  ): IApi.IDutyApi.GetScheduleForChatResponse {
    return this.dutyService.getScheduleForChat(data.chatId);
  }

  @Post('updateChatSchedule')
  public updateChatSchedule(
    @Body() data: UpdateChatScheduleDto
  ): Promise<IApi.IDutyApi.UpdateChatScheduleResponse> {
    return this.dutyService.updateChatSchedule(data.chatId, data.schedule);
  }
}
