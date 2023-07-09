import { IApi } from '@vera-reforged/common';

import { IsNotEmpty, IsString } from 'class-validator';

import { WithChatIdDto } from '../convo/convo.dto';

export class UpdateHelloMessageDto
  extends WithChatIdDto
  implements IApi.IHelloMessagesApi.UpdateHelloMessageRequest
{
  @IsString()
  @IsNotEmpty()
  message: string;
}
