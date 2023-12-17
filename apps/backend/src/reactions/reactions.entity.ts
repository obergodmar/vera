import { IReactions } from '@vera-reforged/common';

import { Column, Entity, Unique } from 'typeorm';

import { DefaultColumns } from '../entities/default-columns';

@Entity()
@Unique(['id'])
export class Reaction
  extends DefaultColumns
  implements IReactions.ChatReaction
{
  @Column({ type: 'bigint', unsigned: true })
  chatId: number;

  @Column({ type: 'text' })
  textTrigger: string;

  @Column({ type: 'text' })
  reaction: string;

  @Column({ type: 'boolean', default: false })
  enabled: boolean;
}
