import { ISettings } from '@vera-reforged/common';

import { Column, Entity, Unique } from 'typeorm';

import { DefaultColumns } from '../entities/default-columns';

@Entity()
@Unique(['id', 'opt'])
export class Setting extends DefaultColumns implements ISettings.Item {
  @Column({ type: 'varchar', length: 150, unique: true })
  opt: string;

  @Column({ type: 'text', nullable: true })
  val: string;
}
