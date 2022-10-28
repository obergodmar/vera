import { ApiProperty } from '@nestjs/swagger';

import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

export class ParticipantsDto {
  @ApiProperty({ enum: ['pick', 'all'] })
  @IsString()
  kind: 'all' | 'pick';

  @IsNumber()
  count: number;

  @ApiProperty({ required: false })
  @ValidateIf((obj) => obj?.kind === 'pick')
  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  memberIds: number[];
}

export class RepeatDto {
  @ApiProperty({ enum: ['custom', 'once', 'daily', 'weekly'] })
  @IsString()
  kind: 'once' | 'daily' | 'weekly' | 'custom';

  @ApiProperty({ required: false })
  @ValidateIf((obj) => obj?.kind === 'custom')
  @IsNotEmpty()
  @IsNumber()
  interval: number;
}

export class WhenDto {
  @IsNumber()
  time: number;

  @ValidateNested()
  @Type(() => RepeatDto)
  repeat: RepeatDto;
}

export class CreateNewMeetingDto {
  @IsString()
  id: string;

  @IsString()
  title: string;

  @IsNumber()
  peerId: number;

  @ValidateNested()
  @Type(() => ParticipantsDto)
  participants: ParticipantsDto;

  @ValidateNested()
  @Type(() => WhenDto)
  when: WhenDto;

  @ApiProperty({ required: false })
  @IsString()
  inviteText: string;
}
