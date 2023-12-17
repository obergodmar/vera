import { IHelloMessages } from '@vera-reforged/common';

import { Column, Entity, Unique } from 'typeorm';

import { DefaultColumns } from '../entities/default-columns';

@Entity()
@Unique(['id', 'chatId'])
export class HelloMessage
  extends DefaultColumns
  implements IHelloMessages.MessagePerChat
{
  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'bigint', unsigned: true, unique: true })
  chatId: number;
}
