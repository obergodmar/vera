import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HelloMessage } from '../hello-messages/hello-messages.entity';
import { Convo } from './convo.entity';

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
        Convo,
        /**
         * Functionality
         */
        HelloMessage,
      ],
    }),
  ],
})
export class DatabaseModule {}
