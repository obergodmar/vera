import { IHelloMessages } from '@vera-reforged/common';

import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity()
@Unique(['chatId'])
export class HelloMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  message: IHelloMessages.Message;

  @Column()
  chatId: number;
}
