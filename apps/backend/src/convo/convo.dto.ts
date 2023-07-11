import { IApi } from '@vera-reforged/common';

import { IsNumber } from 'class-validator';

import { TokenDto } from '../login/dto/token.dto';

export class WithChatIdDto
  extends TokenDto
  implements IApi.TokenRequest<IApi.WithChatId>
{
  @IsNumber()
  chatId!: number;
}

export class GetChatsDto
  extends TokenDto
  implements IApi.IConvoApi.GetChatsRequest {}
