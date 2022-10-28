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

  public async createMeeting(
    meetingDto: CreateNewMeetingDto,
    createCronJob: (time: Date, peerId: number, message: string) => string
  ) {
    const {
      peerId,
      when: { time },
      inviteText,
    } = meetingDto;

    try {
      const cronJobId = createCronJob(new Date(time), peerId, inviteText);

      const existingChat = await this.meetingModel.findOne({ peerId }).exec();

      const meeting = { ...meetingDto, cronJobId };

      if (existingChat && Array.isArray(existingChat.meetings)) {
        existingChat.meetings.push(meeting);

        await existingChat.save();
      } else {
        await this.meetingModel.create({ peerId, meetings: [meeting] });
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
    createThreadDto: CreateNewMeetingDto,
    createCronJob: (time: Date, peerId: number, message: string) => string,
    cancelCronJob: (cronJobId: string) => void
  ) {
    const _id = new ObjectId(meetingId);

    const {
      when: { time },
      inviteText,
    } = createThreadDto;

    try {
      const result = await this.meetingModel
        .findOne({
          peerId,
          meetings: {
            $elemMatch: { _id },
          },
        })
        .exec();

      let cronJobId = result?.meetings?.[0]?.cronJobId;
      if (cronJobId) {
        cancelCronJob(cronJobId);
        cronJobId = createCronJob(new Date(time), peerId, inviteText);
      }

      await this.meetingModel
        .updateOne(
          {
            peerId,
            meetings: {
              $elemMatch: { _id },
            },
          },
          { $set: { 'meetings.$': { ...createThreadDto, _id, cronJobId } } }
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
    meetingId: string,
    cancelCronJob: (cronJobId: string) => void
  ) {
    const _id = new ObjectId(meetingId);

    try {
      const result = await this.meetingModel
        .findOne({
          peerId,
          meetings: {
            $elemMatch: { _id },
          },
        })
        .exec();

      const cronJobId = result?.meetings?.[0]?.cronJobId;
      if (cronJobId) {
        cancelCronJob(cronJobId);
      }

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
