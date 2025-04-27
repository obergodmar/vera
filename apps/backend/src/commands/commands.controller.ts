import { Body, Controller, HttpCode, Inject, Post } from '@nestjs/common';
import { IApi, ROUTES } from '@vera-reforged/common';

import { WithChatIdDto } from '../convo/convo.dto';
import {
  CreateRollCommandDto,
  DeleteRollCommandDto,
  UpdateRollCommandDto,
} from './commands.dto';
import { CommandsService } from './commands.service';

const { prefix, endpoints } = ROUTES.commands;

@Controller(prefix)
export class CommandsController {
  public constructor(
    @Inject(CommandsService) private readonly commandsService: CommandsService,
  ) {}

  @Post(endpoints.createRollCommandForChat)
  @HttpCode(200)
  public createRollCommandForChat(
    @Body() data: CreateRollCommandDto,
  ): Promise<IApi.ICommandsApi.CreateRollCommandForChatResponse> {
    return this.commandsService.createRollCommandForChat(data);
  }

  @Post(endpoints.updateRollCommandForChat)
  @HttpCode(200)
  public updateRollCommandForChat(
    @Body() data: UpdateRollCommandDto,
  ): Promise<IApi.ICommandsApi.UpdateRollCommandForChatResponse> {
    return this.commandsService.updateRollCommandForChat(data);
  }

  @Post(endpoints.deleteRollCommandForChat)
  @HttpCode(200)
  public deleteRollCommandForChat(
    @Body() data: DeleteRollCommandDto,
  ): Promise<IApi.ICommandsApi.DeleteRollCommandForChatResponse> {
    return this.commandsService.deleteRollCommandForChat(data);
  }

  @Post(endpoints.getCommandsChats)
  @HttpCode(200)
  public getCommandsChats(): Promise<IApi.ICommandsApi.GetCommandsChatsResponse> {
    return this.commandsService.getCommandsChats();
  }

  @Post(endpoints.getCommandsForChat)
  @HttpCode(200)
  public getCommandsForChat(
    @Body() data: WithChatIdDto,
  ): Promise<IApi.ICommandsApi.GetCommandsForChatResponse> {
    return this.commandsService.getCommandsForChat(data.chatId);
  }

  @Post(endpoints.disableCommandsForChat)
  @HttpCode(200)
  public disableCommandsForChat(
    @Body() data: WithChatIdDto,
  ): Promise<IApi.ICommandsApi.DisableCommandsForChatResponse> {
    return this.commandsService.disableCommandsForChat(data.chatId);
  }

  @Post(endpoints.disableAllCommands)
  @HttpCode(200)
  public disableAllCommands(): Promise<IApi.ICommandsApi.DisableAllCommandsResponse> {
    return this.commandsService.disableAllCommands();
  }

}
