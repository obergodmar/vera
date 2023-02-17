import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';

import { join } from 'path';

import { ConfigModule } from '../config/config.module';
import { DutyModule } from '../duty/duty.module';
import { LoggerModule } from '../logger/logger.module';
import { LoginModule } from '../login/login.module';
import { VkApiModule } from '../vk-api/vk-api.module';

@Module({
  imports: [
    LoggerModule,
    VkApiModule,
    ConfigModule,
    LoginModule,
    DutyModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'frontend'),
    }),
  ],
})
export class AppModule {}
