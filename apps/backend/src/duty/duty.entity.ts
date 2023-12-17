import { Column, Entity, Unique } from 'typeorm';

import { DefaultColumns } from '../entities/default-columns';

@Entity()
@Unique(['id'])
export class Duty extends DefaultColumns {
  @Column({ type: 'bigint', unsigned: true })
  chatId: number;

  @Column({ type: 'bigint', unsigned: false })
  userId: number;

  @Column({ type: 'tinyint', unsigned: true, nullable: true, default: null })
  dayNumber?: number | null;

  @Column({ type: 'char', length: 5, nullable: true, default: null })
  timeFrom?: string | null;

  @Column({ type: 'char', length: 5, nullable: true, default: null })
  timeTo?: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true, default: null })
  tag?: string | null;
}
