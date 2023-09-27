import { ISettings } from '@vera-reforged/common';

import { Column, PrimaryColumn } from 'typeorm';

export class Setting implements ISettings.Item {
  @PrimaryColumn()
  opt: 'debug_log_to_vk';

  @Column()
  val: string;
}
