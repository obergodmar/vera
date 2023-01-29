import { Module } from '@nestjs/common';

import { ApiModule } from '../api/api.module';
import { AuthorizationModule } from '../authorization/authorization.module';
import { DutyModule } from '../duty/duty.module';

@Module({
  imports: [ApiModule, AuthorizationModule, DutyModule],
})
export class AppModule {}
