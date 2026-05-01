import { IApi } from '@vera-reforged/common';

import { Transform, TransformFnParams } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

import { TokenDto } from '../auth/dto/token.dto';

export class CreateRollCommandDto
  extends TokenDto
  implements IApi.ICommandsApi.CreateRollCommandForChatRequest
{
  @IsNumber()
  chatId: number;

  @IsString()
  @Transform(({ value }: TransformFnParams) => value?.trim())
  phrase: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }: TransformFnParams) =>
    value?.replaceAll(' ', '')?.trim(),
  )
  name?: string;

  @IsString()
  membersIds: string;

  @IsBoolean()
  enabled: boolean;
}

export class DeleteRollCommandDto
  extends TokenDto
  implements IApi.ICommandsApi.DeleteRollCommandForChatRequest
{
  @IsNumber()
  chatId: number;

  @IsNumber()
  id: number;
}

export class UpdateRollCommandDto
  extends CreateRollCommandDto
  implements IApi.ICommandsApi.UpdateRollCommandForChatRequest
{
  @IsNumber()
  id: number;
}
