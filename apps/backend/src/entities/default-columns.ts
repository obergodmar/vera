import { Column, PrimaryGeneratedColumn } from 'typeorm';

export class DefaultColumns {
  @PrimaryGeneratedColumn('increment', { type: 'int', unsigned: true })
  id: number;

  @Column({
    type: 'timestamp',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
    insert: false,
  })
  created?: number;

  @Column({
    type: 'timestamp',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'NOW()',
    insert: false,
  })
  modified?: number;
}
