import { Body, Controller, Inject, Post } from '@nestjs/common';
import { IApi, ROUTES } from '@vera-reforged/common';

import {
  UpdateAllHelloMessagesDto,
  UpdateHelloMessageDto,
} from './hello-messages.dto';
import { HelloMessagesService } from './hello-messages.service';

const { prefix, endpoints } = ROUTES.helloMessages;

@Controller(prefix)
export class HelloMessagesController {
  public constructor(
    @Inject(HelloMessagesService)
    private readonly hlService: HelloMessagesService,
  ) {}

  @Post(endpoints.getHelloMessages)
  public getHelloMessages(): Promise<IApi.IHelloMessagesApi.GetHelloMessagesResponse> {
    return this.hlService.getHelloMessages();
  }

  @Post(endpoints.updateHelloMessage)
  public updateHelloMessage(
    @Body() data: UpdateHelloMessageDto,
  ): Promise<IApi.IHelloMessagesApi.UpdateHelloMessageResponse> {
    return this.hlService.updateHelloMessage(data.chatId, data.message);
  }

  @Post(endpoints.updateAllHelloMessages)
  public updateAllHelloMessages(
    @Body() data: UpdateAllHelloMessagesDto,
  ): Promise<IApi.IHelloMessagesApi.UpdateAllHelloMessagesResponse> {
    return this.hlService.updateAllHelloMessages(data.updates);
  }
}
