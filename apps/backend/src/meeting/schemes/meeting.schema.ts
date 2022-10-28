import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { ParticipantsDto, WhenDto } from '../dto/create-new-meeting.dto';

export type MeetingDocument = Chat & Document;

@Schema()
export class Meeting {
  @Prop()
  title: string;

  @Prop()
  peerId: number;

  @Prop({ type: 'Object' })
  participants: ParticipantsDto;

  @Prop({ type: 'Object' })
  when: WhenDto;

  @Prop()
  inviteText: string;

  @Prop()
  cronJobId: string;
}

const MeetingArraySchema = SchemaFactory.createForClass(Meeting);

@Schema()
export class Chat {
  @Prop()
  peerId: number;

  @Prop({ type: [MeetingArraySchema] })
  meetings: Meeting[];
}

export const MeetingSchema = SchemaFactory.createForClass(Chat);
