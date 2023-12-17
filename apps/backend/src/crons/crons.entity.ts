import { ICrons } from '@vera-reforged/common';

import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity()
@Unique(['id'])
export class Cron implements ICrons.ChatCron {
  @PrimaryGeneratedColumn('increment')
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
  buttons: string;

  @Column()
  startDate: number;

  @Column()
  repeat: number;

  @Column()
  enabled: boolean;
}
