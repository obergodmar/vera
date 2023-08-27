import { ICrons } from '@vera-reforged/common';

import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity()
@Unique(['id'])
export class Cron implements ICrons.ChatCron {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  chatId: number;

  @Column()
  message: string;

  @Column()
  daysRange: string;

  @Column()
  timeAt: string;

  @Column()
  enabled: boolean;
}
