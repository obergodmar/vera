import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type GreetingDocument = Greeting & Document;

@Schema()
export class Greeting {
  @Prop()
  peerId: number;

  @Prop()
  text: string;
}

export const GreetingSchema = SchemaFactory.createForClass(Greeting);
