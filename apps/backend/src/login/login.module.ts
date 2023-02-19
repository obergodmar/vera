import { Module } from '@nestjs/common';

import { LoggerModule } from '../logger/logger.module';
import { LoginController } from './login.controller';
import { LoginService } from './login.service';

@Module({
  imports: [LoggerModule],
  controllers: [LoginController],
  providers: [LoginService],
})
export class LoginModule {}
