import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Cron } from '../crons/crons.entity';
import { Duty } from '../duty/duty.entity';
import { HelloMessage } from '../hello-messages/hello-messages.entity';
import { Reaction } from '../reactions/reactions.entity';
import { Setting } from '../settings/settings.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'vera',
      password: 'password',
      database: 'vera',
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
    }),
  ],
})
export class DatabaseModule {}
