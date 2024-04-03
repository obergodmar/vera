import { IApi, IHelloMessages } from '@vera-reforged/common';

import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsString, ValidateNested } from 'class-validator';

import { TokenDto } from '../auth/dto/token.dto';
import { WithChatIdDto } from '../convo/convo.dto';

export class UpdateHelloMessageDto
  extends WithChatIdDto
  implements IApi.IHelloMessagesApi.UpdateHelloMessageRequest
{
  @IsString()
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
