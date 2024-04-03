import { IApi, ScheduleModel } from '@vera-reforged/common';

import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

import { TokenDto } from '../auth/dto/token.dto';
import { WithChatIdDto } from '../convo/convo.dto';

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
