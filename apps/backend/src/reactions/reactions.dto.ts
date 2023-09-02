import { IApi, IReactions } from '@vera-reforged/common';

import { Transform, TransformFnParams } from 'class-transformer';
import { IsBoolean, IsNumber, IsString } from 'class-validator';

import { TokenDto } from '../login/dto/token.dto';

class BasicReactionDto
  extends TokenDto
  implements Omit<IReactions.ChatReaction, 'id'>
{
  @IsNumber()
  chatId: number;

  @IsString()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  reaction: string;

  @IsString()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  textTrigger: string;

  @IsBoolean()
  enabled: boolean;
}

export class CreateReactionForChatDto
  extends BasicReactionDto
  implements IApi.IReactionsApi.CreateReactionForChatRequest {}

export class UpdateReactionForChatDto
  extends BasicReactionDto
  implements IApi.IReactionsApi.UpdateReactionForChatRequest
{
  @IsNumber()
  id: number;
}
