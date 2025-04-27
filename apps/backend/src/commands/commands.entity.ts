import { ICommands } from 'libs/common/src/lib/commands';
import { Column, Entity, Unique } from 'typeorm';

import { DefaultColumns } from '../entities/default-columns';

@Entity()
@Unique(['id'])
export class Command extends DefaultColumns implements ICommands.Command {
  @Column({ type: 'bigint', unsigned: true })
  chatId: number;

  @Column({ type: 'text' })
  // @ts-expect-error string is not assignable to type 'CommandType'
  command: string;

  @Column({ type: 'boolean', default: false })
  enabled: boolean;

  @Column({ type: 'text' })
  name?: string;
}

@Entity()
@Unique(['id'])
export class RollCommand
  extends DefaultColumns
  implements ICommands.RollCommand
{
  @Column({ type: 'bigint', unsigned: true })
  chatId: number;

  @Column({ type: 'text' })
  phrase: string;

  @Column({ type: 'text' })
  membersIds: string;
}
