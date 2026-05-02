import { DynamicModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DataSourceOptions } from 'typeorm';

import { TelegramChat } from '../bot-platform/entities/telegram-chat.entity';
import { TelegramChatMember } from '../bot-platform/entities/telegram-chat-member.entity';
import { Command, RollCommand } from '../commands/commands.entity';
import { Cron } from '../crons/crons.entity';
import { Duty } from '../duty/duty.entity';
import { IEnvironment } from '../environments/env-type';
import { HelloMessage } from '../hello-messages/hello-messages.entity';
import { Reaction } from '../reactions/reactions.entity';
import { Setting } from '../settings/settings.entity';
import { CreateAllTables1675006675000 } from './migrations/1675006675000-create-all-tables';
import { ReactionCallDuty1705184240582 } from './migrations/1705184240582-reaction-callDuty';
import { CreateRollTable1717355265635 } from './migrations/1717355265635-create-roll-table';
import { CreateCommandTable1739712942753 } from './migrations/1739712942753-create-command-table';
import { TelegramPlatformTables1746140400000 } from './migrations/1746140400000-telegram-platform-tables';

export function getOrmConfig(env: IEnvironment): DataSourceOptions {
  return {
    type: 'mysql',
    host: env.dbHost,
    port: env.dbPort,
    database: env.dbName,
    username: env.dbUsername,
    password: env.dbPassword,
    entities: [
      Setting,
      Duty,
      HelloMessage,
      Reaction,
      Cron,
      Command,
      RollCommand,
      TelegramChat,
      TelegramChatMember,
    ],
    migrations: [
      CreateAllTables1675006675000,
      ReactionCallDuty1705184240582,
      CreateRollTable1717355265635,
      CreateCommandTable1739712942753,
      TelegramPlatformTables1746140400000,
    ],
    migrationsRun: true,
    bigNumberStrings: false,
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
