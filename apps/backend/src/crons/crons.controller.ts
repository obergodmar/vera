import { Body, Controller, Inject, Post } from '@nestjs/common';
import { IApi, ROUTES } from '@vera-reforged/common';

import { WithChatIdDto } from '../convo/convo.dto';
import { CreateCronForChatDto, UpdateCronForChatDto } from './crons.dto';
import { CronsService } from './crons.service';

const { prefix, endpoints } = ROUTES.crons;

@Controller(prefix)
export class CronsController {
  public constructor(
    @Inject(CronsService)
    private readonly cronsService: CronsService
  ) {}

  @Post(endpoints.getCronsForChat)
  public getCronsForChat(
    @Body() data: WithChatIdDto
  ): Promise<IApi.ICronsApi.GetCronsForChatResponse> {
    return this.cronsService.getCronsForChat(data.chatId);
  }

  @Post(endpoints.createCronForChat)
  public createCronForChat(
    @Body() data: CreateCronForChatDto
  ): Promise<IApi.ICronsApi.CreateCronForChatResponse> {
    return this.cronsService.createCronForChat(data);
  }

  @Post(endpoints.updateCronForChat)
  public updateCronForChat(
    @Body() data: UpdateCronForChatDto
  ): Promise<IApi.ICronsApi.UpdateCronForChatResponse> {
    return this.cronsService.updateCronForChat(data);
  }

  @Post(endpoints.disableCronsForChat)
  public disableCronsForChat(
    @Body() data: WithChatIdDto
  ): Promise<IApi.ICronsApi.DisableCronsForChatResponse> {
    return this.cronsService.disableCronsForChat(data.chatId);
  }

  @Post(endpoints.disableAllCrons)
  public disableAllCrons(): Promise<IApi.ICronsApi.DisableAllCronsResponse> {
    return this.cronsService.disableAllCrons();
  }
}
