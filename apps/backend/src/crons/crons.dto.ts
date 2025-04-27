import { IApi } from '@vera-reforged/common';

import { Transform, TransformFnParams } from 'class-transformer';
import { IsBoolean, IsNumber, IsString } from 'class-validator';

import { TokenDto } from '../auth/dto/token.dto';

class BasicCronsDto
  extends TokenDto
  implements IApi.ICronsApi.CreateCronForChatRequest
{
  @IsNumber()
  chatId: number;

  @IsString()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  message: string;

  @IsString()
  daysRange: string;

  @IsString()
  timeAt: string;

  @IsString()
  buttons: string;

  @IsNumber()
  startDate: number;

  @IsNumber()
  repeat: number;

  @IsBoolean()
  enabled: boolean;
}

export class CreateCronForChatDto
  extends BasicCronsDto
  implements IApi.ICronsApi.CreateCronForChatRequest {}

export class UpdateCronForChatDto
  extends BasicCronsDto
  implements IApi.ICronsApi.UpdateCronForChatRequest
{
  @IsNumber()
  id: number;
}
