import { IReactions } from '@vera-reforged/common';

import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity()
@Unique(['id'])
export class Reaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  chatId: number;

  @Column()
  textTrigger: IReactions.Trigger;

  @Column()
  reaction: IReactions.Reaction;
}
