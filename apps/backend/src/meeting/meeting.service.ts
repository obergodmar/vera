import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { MongoUnexpectedServerResponseError, ObjectId } from 'mongodb';
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
      return new MongoUnexpectedServerResponseError(
        'Ошибка при попытке создать встречу'
      );
    }

    return {};
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
      return new MongoUnexpectedServerResponseError(
        'Ошибка при попытке получить встречи'
      );
    }
  }

  public async updateMeetingByPeerIdAndMeetingId(
    peerId: number,
    meetingId: string,
    createThreadDto: CreateNewMeetingDto
  ) {
    const _id = new ObjectId(meetingId);

    try {
      await this.meetingModel
        .updateOne(
          {
            peerId,
            meetings: {
              $elemMatch: { _id },
            },
          },
          { $set: { 'meetings.$': { ...createThreadDto, _id } } }
        )
        .exec();
    } catch (e: unknown) {
      console.error(e);
      return new MongoUnexpectedServerResponseError(
        'Ошибка при попытке обновить встречу'
      );
    }

    return {};
  }

  public async deleteMeetingByPeerIdAndMeetingId(
    peerId: number,
    meetingId: string
  ) {
    const _id = new ObjectId(meetingId);

    try {
      await this.meetingModel
        .updateOne(
          {
            peerId,
          },
          {
            $pull: {
              meetings: { _id: { $eq: _id } },
            },
          }
        )
        .exec();
    } catch (e: unknown) {
      console.error(e);
      return new MongoUnexpectedServerResponseError(
        'Ошибка при попытке удалить встречу'
      );
    }

    return {};
  }
}
