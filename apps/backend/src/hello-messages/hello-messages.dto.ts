import { IApi, IHelloMessages } from '@vera-reforged/common';

import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';

import { WithChatIdDto } from '../convo/convo.dto';
import { TokenDto } from '../login/dto/token.dto';

export class UpdateHelloMessageDto
  extends WithChatIdDto
  implements IApi.IHelloMessagesApi.UpdateHelloMessageRequest
{
  @IsString()
  @IsNotEmpty()
  message: string;
}

class MessagePerChat implements IHelloMessages.MessagePerChat {
  @IsNumber()
  chatId: number;

  @IsString()
  message: IHelloMessages.Message;
}

export class UpdateAllHelloMessagesDto
  extends TokenDto
  implements IApi.IHelloMessagesApi.UpdateAllHelloMessagesRequest
{
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MessagePerChat)
  updates: MessagePerChat[];
}
