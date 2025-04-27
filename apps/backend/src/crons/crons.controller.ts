import { Body, Controller, HttpCode, Inject, Post } from '@nestjs/common';
import { IApi, ROUTES } from '@vera-reforged/common';

import { WithChatIdDto } from '../convo/convo.dto';
import { CreateCronForChatDto, UpdateCronForChatDto } from './crons.dto';
import { CronsService } from './crons.service';

const { prefix, endpoints } = ROUTES.crons;

@Controller(prefix)
export class CronsController {
  public constructor(
    @Inject(CronsService)
    private readonly cronsService: CronsService,
  ) {}

  @Post(endpoints.getCronsForChat)
  @HttpCode(200)
  public getCronsForChat(
    @Body() data: WithChatIdDto,
  ): Promise<IApi.ICronsApi.GetCronsForChatResponse> {
    return this.cronsService.getCronsForChat(data.chatId);
  }

  @Post(endpoints.getCronsChats)
  @HttpCode(200)
  public getCronsChatsResponse(): Promise<IApi.ICronsApi.GetCronsChatsResponse> {
    return this.cronsService.getCronsChats();
  }

  @Post(endpoints.createCronForChat)
  @HttpCode(200)
  public createCronForChat(
    @Body() data: CreateCronForChatDto,
  ): Promise<IApi.ICronsApi.CreateCronForChatResponse> {
    return this.cronsService.createCronForChat(data);
  }

  @Post(endpoints.updateCronForChat)
  @HttpCode(200)
  public updateCronForChat(
    @Body() data: UpdateCronForChatDto,
  ): Promise<IApi.ICronsApi.UpdateCronForChatResponse> {
    return this.cronsService.updateCronForChat(data);
  }

  @Post(endpoints.disableCronsForChat)
  @HttpCode(200)
  public disableCronsForChat(
    @Body() data: WithChatIdDto,
  ): Promise<IApi.ICronsApi.DisableCronsForChatResponse> {
    return this.cronsService.disableCronsForChat(data.chatId);
  }

  @Post(endpoints.disableAllCrons)
  @HttpCode(200)
  public disableAllCrons(): Promise<IApi.ICronsApi.DisableAllCronsResponse> {
    return this.cronsService.disableAllCrons();
  }
}
