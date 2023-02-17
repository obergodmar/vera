import { Body, Controller, Inject, Param, Post } from '@nestjs/common';
import { IApi, IDuty, ROUTES } from '@vera-reforged/common';

import { DutyService } from './duty.service';

@Controller(ROUTES.duty.prefix)
export class DutyController {
  public constructor(
    @Inject(DutyService) private readonly dutyService: DutyService
  ) {}

  @Post('getChats')
  public getChats(): Promise<IApi.IDutyApi['getChats']['response']> {
    return this.dutyService.getChats();
  }

  @Post('getMembersForChat/:chatId')
  public async getMembersForChat(
    @Param('chatId') chatId: number
  ): Promise<IApi.IDutyApi['getMembersForChat']['response']> {
    return this.dutyService.getMembersForChat(chatId);
  }

  @Post('getDays')
  public getDays(): IApi.IDutyApi['getDays']['response'] {
    return this.dutyService.getDays();
  }

  @Post('getSchedule')
  public getSchedule(): IApi.IDutyApi['getSchedule']['response'] {
    return this.dutyService.getSchedule();
  }

  @Post('getScheduleForChat/:chatId')
  public getScheduleForChat(
    @Param('chatId') chatId: number
  ): IApi.IDutyApi['getScheduleForChat']['response'] {
    return this.dutyService.getScheduleForChat(chatId);
  }

  @Post('updateSchedule')
  public addDuty(
    @Body('schedule') schedule: IDuty.Schedule[]
  ): IApi.IDutyApi['updateSchedule']['response'] {
    return this.dutyService.updateSchedule(schedule);
  }
}
