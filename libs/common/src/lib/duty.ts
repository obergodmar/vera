import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export namespace IDuty {
  export interface IDuty {
    chats: number[];
    days: Day[];
    schedule: Schedule[];
  }

  export type Day = {
    shortName: string;
    name: string;
    nameWhen: string;
    dayNumber: number;
  };

  export type Schedule = {
    chatId: number;
    peerId: number;
    firstName: string;
    lastName: string;
    avatar: string;
    screenName: string;
    dayNumber: number | undefined;
    timeFrom: string;
    timeTo: string;
    tag?: string;
  };
}

export class DutyConfigModel implements IDuty.IDuty {
  @IsArray()
  chats!: number[];

  @ValidateNested({ each: true })
  @Type(() => DayModel)
  days!: DayModel[];

  @ValidateNested({ each: true })
  @Type(() => ScheduleModel)
  schedule!: IDuty.Schedule[];
}

export class DayModel implements IDuty.Day {
  @IsString()
  shortName!: string;

  @IsString()
  name!: string;

  @IsString()
  nameWhen!: string;

  @IsNumber()
  dayNumber!: number;
}

export class ScheduleModel implements IDuty.Schedule {
  @IsNumber()
  chatId!: number;

  @IsNumber()
  peerId!: number;

  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsString()
  avatar!: string;

  @IsString()
  screenName!: string;

  @IsOptional()
  @IsNumber()
  dayNumber: number | undefined;

  @IsString()
  timeFrom!: string;

  @IsString()
  timeTo!: string;

  @IsOptional()
  @IsString()
  tag?: string;
}
