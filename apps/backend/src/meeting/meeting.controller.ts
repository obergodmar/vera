import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { BotService } from '../app/bot.service';
import { CreateNewMeetingDto } from './dto/create-new-meeting.dto';
import { MeetingService } from './meeting.service';

@Controller('meetings')
export class MeetingController {
  private readonly createCronJob: (
    time: Date,
    peerId: number,
    message: string
  ) => string;

  private readonly cancelCronJob: (cronJobId: string) => void;

  public constructor(
    private readonly meetingsService: MeetingService,
    private readonly botService: BotService
  ) {
    this.botService.start().catch((e) => console.error(e));

    this.createCronJob = this.botService.createCronJob.bind(this.botService);
    this.cancelCronJob = this.botService.cancelCronJob.bind(this.botService);
  }

  @Post('create')
  public async createMeeting(@Body() createThreadDto: CreateNewMeetingDto) {
    return this.meetingsService.createMeeting(
      createThreadDto,
      this.createCronJob
    );
  }

  @Get(':peerId')
  public async getMeetingsByPeerId(@Param('peerId') peerId: number) {
    return this.meetingsService.getMeetingsByPeerId(peerId);
  }

  @Patch('update/:peerId/:meetingId')
  public async updateMeetingByPeerIdAndMeetingId(
    @Param('peerId') peerId: number,
    @Param('meetingId') meetingId: string,
    @Body() createThreadDto: CreateNewMeetingDto
  ) {
    return this.meetingsService.updateMeetingByPeerIdAndMeetingId(
      peerId,
      meetingId,
      createThreadDto,
      this.createCronJob,
      this.cancelCronJob
    );
  }

  @Delete('remove/:peerId/:meetingId')
  public async deleteMeetingByPeerIdAndMeetingId(
    @Param('peerId') peerId: number,
    @Param('meetingId') meetingId: string
  ) {
    return this.meetingsService.deleteMeetingByPeerIdAndMeetingId(
      peerId,
      meetingId,
      this.cancelCronJob
    );
  }
}
