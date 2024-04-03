import { IApi } from '@vera-reforged/common';

export class AuthDto implements IApi.IAuthApi.AuthRequest {
  readonly data: IApi.IAuthApi.AuthRequest['data'];
}
