import { IApi } from '@vera-reforged/common';

import { IsNumber, IsString } from 'class-validator';

import { TokenDto } from '../login/dto/token.dto';

class BasicReactionDto extends TokenDto {
  @IsNumber()
  chatId: number;

  @IsString()
  reaction: string;

  @IsString()
  textTrigger: string;
}

export class CreateReactionForChat
  extends BasicReactionDto
  implements IApi.IReactionsApi.CreateReactionForChatRequest {}

export class UpdateReactionForChat
  extends BasicReactionDto
  implements IApi.IReactionsApi.UpdateReactionForChatRequest
{
  @IsNumber()
  id: number;
}
