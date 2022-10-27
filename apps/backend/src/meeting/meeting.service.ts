import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';

import { CreateNewMeetingDto } from './dto/create-new-meeting.dto';
import { Meeting, MeetingDocument } from './schemes/meeting.schema';

@Injectable()
export class MeetingService {
  constructor(
    @InjectModel(Meeting.name)
    private readonly meetingModel: Model<MeetingDocument>
  ) {}

  public async createMeeting(meetingDto: CreateNewMeetingDto) {
    const { peerId } = meetingDto;

    try {
      const existingChat = await this.meetingModel.findOne({ peerId }).exec();

      if (existingChat && Array.isArray(existingChat.meetings)) {
        existingChat.meetings.push(meetingDto);

        await existingChat.save();
      } else {
        await this.meetingModel.create({ peerId, meetings: [meetingDto] });
      }
    } catch (e: unknown) {
      console.error(e);
    }
  }

  public async getMeetingsByPeerId(peerId: number) {
    try {
      const existingChat = await this.meetingModel
        .findOne({ peerId }, { __v: 0 })
        .exec();

      if (!existingChat) {
        return [];
      }

      return existingChat.meetings;
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  public async updateMeetingByPeerIdAndMeetingId(
    peerId: number,
    meetingId: string,
    createThreadDto: CreateNewMeetingDto
  ) {
    const _id = new ObjectId(meetingId);

    try {
      const meetingMatch = await this.meetingModel
        .findOne(
          {
            peerId,
          },
          {
            meetings: {
              $elemMatch: { _id },
            },
          }
        )
        .exec();

      if (!meetingMatch || !meetingMatch.meetings?.length) {
        return new NotFoundException('Встреча не найдена');
      }

      Object.assign(meetingMatch.meetings[0], createThreadDto);
      await meetingMatch.save();
    } catch (e) {
      console.error(e);
    }
  }
}
