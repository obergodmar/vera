import { ICrons } from '@vera-reforged/common';

import { Column, Entity, Unique } from 'typeorm';

import { DefaultColumns } from '../entities/default-columns';

@Entity()
@Unique(['id'])
export class Cron extends DefaultColumns implements ICrons.ChatCron {
  @Column({ type: 'bigint', unsigned: true })
  chatId: number;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'text' })
  daysRange: string;

  @Column({ type: 'char', length: 5 })
  timeAt: string;

  @Column({ type: 'text', default: null })
  buttons: string;

  @Column({ type: 'bigint', unsigned: true, default: 1704748172294 })
  startDate: number;

  @Column({ type: 'tinyint', unsigned: true, default: 0 })
  repeat: number;

  @Column({ type: 'boolean', default: false })
  enabled: boolean;
}
