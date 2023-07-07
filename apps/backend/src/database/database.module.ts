import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Convo } from '../convo/convo.entity';
import { HelloMessage } from '../hello-messages/hello-messages.entity';

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
