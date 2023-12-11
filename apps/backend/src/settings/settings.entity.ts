import { ISettings } from '@vera-reforged/common';

import { Column, Entity, PrimaryColumn, Unique } from 'typeorm';

@Entity()
@Unique(['opt'])
export class Setting implements ISettings.Item {
  @PrimaryColumn()
  opt: string;

  @Column()
  val: string;
}
