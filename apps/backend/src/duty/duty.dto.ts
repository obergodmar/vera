import { IApi, ScheduleModel } from '@vera-reforged/common';

import { Type } from 'class-transformer';
import { IsNumber, ValidateNested } from 'class-validator';

import { TokenDto } from '../login/dto/token.dto';

class WithChatIdDto
  extends TokenDto
  implements IApi.TokenRequest<IApi.WithChatId>
{
  @IsNumber()
  chatId!: number;
}

export class GetChatsDto
  extends TokenDto
  implements IApi.IDutyApi.GetChatsRequest {}

export class GetMembersFotChatDto
  extends WithChatIdDto
  implements IApi.IDutyApi.GetMembersForChatRequest {}

export class GetDaysDto
  extends TokenDto
  implements IApi.IDutyApi.GetDaysRequest {}

export class GetScheduleForChatDto
  extends WithChatIdDto
  implements IApi.IDutyApi.GetScheduleForChatRequest {}

export class GetScheduleDto
  extends TokenDto
  implements IApi.IDutyApi.GetScheduleRequest {}

export class UpdateChatScheduleDto
  extends WithChatIdDto
  implements IApi.IDutyApi.UpdateChatScheduleRequest
{
  @ValidateNested({ each: true })
  @Type(() => ScheduleModel)
  schedule!: ScheduleModel[];
}
