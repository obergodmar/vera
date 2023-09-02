import { IApi, ICrons } from '@vera-reforged/common';

import { Transform, TransformFnParams } from 'class-transformer';
import { IsBoolean, IsNumber, IsString } from 'class-validator';

import { TokenDto } from '../login/dto/token.dto';

class BasicCronsDto extends TokenDto implements Omit<ICrons.ChatCron, 'id'> {
  @IsNumber()
  chatId: number;

  @IsString()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  message: string;

  @IsString()
  daysRange: string;

  @IsString()
  timeAt: string;

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
