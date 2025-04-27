import { Body, Controller, HttpCode, Inject, Post, Req } from '@nestjs/common';
import { IApi, ROUTES } from '@vera-reforged/common';

import { Request } from 'express';

import { GetMembersForChatDto } from './convo.dto';
import { ConvoService } from './convo.service';

const { prefix, endpoints } = ROUTES.convo;

@Controller(prefix)
export class ConvoController {
  public constructor(
    @Inject(ConvoService) private readonly convoService: ConvoService,
  ) {}

  @Post(endpoints.getChats)
  @HttpCode(200)
  public getConvos(
    @Req() req: Request,
  ): Promise<IApi.IConvoApi.GetChatsResponse> {
    return this.convoService.getChats(req);
  }

  @Post(endpoints.getMembersForChat)
  @HttpCode(200)
  public async getMembersForChat(
    @Body() data: GetMembersForChatDto,
  ): Promise<IApi.IConvoApi.GetMembersForChatResponse> {
    return this.convoService.getMembersForChat(data.chatId);
  }
}
