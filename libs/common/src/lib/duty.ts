import { IsNumber, IsOptional, IsString } from 'class-validator';

export const TAG_MAX_WIDTH = 50;

export namespace IDuty {
  export interface IDuty {
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
    userId: number;
    firstName: string;
    lastName: string;
    photo?: string;
    username?: string;
    mention?: string;
    dayNumber: number | undefined;
    timeFrom: string;
    timeTo: string;
    tag?: string;
  };
}

export class ScheduleModel implements IDuty.Schedule {
  @IsNumber()
  chatId!: number;

  @IsNumber()
  userId!: number;

  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

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
