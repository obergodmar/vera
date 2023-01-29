import { Module } from '@nestjs/common';

import { ApiModule } from '../api/api.module';
import { AuthorizationModule } from '../authorization/authorization.module';

@Module({
  imports: [ApiModule, AuthorizationModule],
})
export class AppModule {}
