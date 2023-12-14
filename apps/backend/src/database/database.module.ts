import { DynamicModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Cron } from '../crons/crons.entity';
import { Duty } from '../duty/duty.entity';
import { IEnvironment } from '../environments/env-type';
import { HelloMessage } from '../hello-messages/hello-messages.entity';
import { Reaction } from '../reactions/reactions.entity';
import { Setting } from '../settings/settings.entity';

export function getOrmConfig(env: IEnvironment) {
  return {
    type: 'mysql' as const,
    host: env.dbHost,
    port: env.dbPort,
    database: env.dbName,
    username: env.dbUsername,
    password: env.dbPassword,
    entities: [
      Setting,
      /**
       * Functionality
       */
      Duty,
      HelloMessage,
      Reaction,
      Cron,
    ],
  };
}

export class DatabaseModule {
  public static forRoot(env: IEnvironment): DynamicModule {
    return {
      module: DatabaseModule,
      imports: [TypeOrmModule.forRoot(getOrmConfig(env))],
    };
  }
}
