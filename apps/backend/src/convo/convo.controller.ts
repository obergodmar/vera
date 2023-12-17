import { Controller, Inject, Post } from '@nestjs/common';
import { IApi, ROUTES } from '@vera-reforged/common';

import { ConvoService } from './convo.service';

const { prefix, endpoints } = ROUTES.convo;

@Controller(prefix)
export class ConvoController {
  public constructor(
    @Inject(ConvoService) private readonly convoService: ConvoService,
  ) {}

  @Post(endpoints.getChats)
  public getConvos(): Promise<IApi.IConvoApi.GetChatsResponse> {
    return this.convoService.getChats();
  }
}
