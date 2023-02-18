import { IApi } from '@vera-reforged/common';

import { IsNotEmpty, IsString } from 'class-validator';

export class TokenDto implements IApi.TokenRequest {
  @IsString()
  @IsNotEmpty()
  token!: string;
}
