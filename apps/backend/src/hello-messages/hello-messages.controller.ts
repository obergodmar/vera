import { Controller, Inject, Post } from '@nestjs/common';
import { IApi, ROUTES } from '@vera-reforged/common';

import { HelloMessagesService } from './hello-messages.service';

@Controller(ROUTES.helloMessages.prefix)
export class HelloMessagesController {
  public constructor(
    @Inject(HelloMessagesService)
    private readonly hlService: HelloMessagesService
  ) {}

  @Post('getChats')
  public getChats(): Promise<IApi.IHelloMessagesApi.GetChatsResponse> {
    return this.hlService.getChats();
  }
}
