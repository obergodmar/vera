import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';

import { join } from 'path';

import { ApiModule } from '../api/api.module';
import { AuthorizationModule } from '../authorization/authorization.module';
import { DutyModule } from '../duty/duty.module';

@Module({
  imports: [
    ApiModule,
    AuthorizationModule,
    DutyModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'frontend'),
    }),
  ],
})
export class AppModule {}
