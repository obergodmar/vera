import { Body, Controller, Get, Param, Post } from '@nestjs/common';

import { CreateNewMeetingDto } from './dto/create-new-meeting.dto';
import { MeetingService } from './meeting.service';

@Controller('meetings')
export class MeetingController {
  public constructor(private readonly meetingsService: MeetingService) {}

  @Post('create')
  public async createMeeting(@Body() createThreadDto: CreateNewMeetingDto) {
    return this.meetingsService.createMeeting(createThreadDto);
  }

  @Get(':peerId')
  public async getMeetingsByPeerId(@Param('peerId') peerId: number) {
    return this.meetingsService.getMeetingsByPeerId(peerId);
  }
}
