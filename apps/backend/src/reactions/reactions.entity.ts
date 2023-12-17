import { IReactions } from '@vera-reforged/common';

import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity()
@Unique(['id'])
export class Reaction implements IReactions.ChatReaction {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  chatId: number;

  @Column()
  textTrigger: string;

  @Column()
  reaction: string;

  @Column()
  enabled: boolean;
}
