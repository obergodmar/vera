import { Body, Controller, Inject, Post } from '@nestjs/common';
import { IApi, ROUTES } from '@vera-reforged/common';

import { WithChatIdDto } from '../convo/convo.dto';
import { CreateReactionForChat, UpdateReactionForChat } from './reactions.dto';
import { ReactionsService } from './reactions.service';

const { prefix, endpoints } = ROUTES.reactions;

@Controller(prefix)
export class ReactionsController {
  public constructor(
    @Inject(ReactionsService)
    private readonly reactionsService: ReactionsService
  ) {}

  @Post(endpoints.createReactionForChat)
  public createReactionForChat(
    @Body() data: CreateReactionForChat
  ): Promise<IApi.IReactionsApi.CreateReactionForChatResponse> {
    return this.reactionsService.createReactionForChat(data);
  }

  @Post(endpoints.getReactionsForChat)
  public getReactionsForChat(
    @Body() data: WithChatIdDto
  ): Promise<IApi.IReactionsApi.GetReactionsForChatResponse> {
    return this.reactionsService.getReactionsForChat(data.chatId);
  }

  @Post(endpoints.updateReactionsForChat)
  public updateReactionsForChat(
    @Body() data: UpdateReactionForChat
  ): Promise<IApi.IReactionsApi.UpdateReactionForChatResponse> {
    return this.reactionsService.updateReactionForChat(data);
  }
}
