import { plainToClass } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsString,
  validateSync,
} from 'class-validator';

import { getEnvConfig } from './env-config';
import { IEnvironment } from './env-type';

export class Environment implements IEnvironment {
  /**
   * ===================
   * Настройки окружения
   */
  @IsBoolean()
  isProd: boolean;
  @IsBoolean()
  disableBotListener: boolean;
  @IsString()
  @IsNotEmpty()
  address: string;
  @IsNumber()
  port: number;
  @IsString()
  @IsNotEmpty()
  secret: string;
  @IsString()
  @IsNotEmpty()
  dbHost: string;
  @IsNumber()
  dbPort: number;
  @IsString()
  @IsNotEmpty()
  dbName: string;
  @IsString()
  @IsNotEmpty()
  dbUsername: string;
  @IsString()
  @IsNotEmpty()
  dbPassword: string;

  /**
   * ==================
   * Настройки апи бота
   */
  @IsString()
  @IsNotEmpty()
  botToken: string;
  @IsNumber()
  botPollingGroupId: number;
  @IsString()
  @IsNotEmpty()
  botApiMode: 'sequential' | 'parallel' | 'parallel_selected';

  /**
   * =================
   * Настройки админки
   */
  @IsNumber()
  settingsChatId: number;
  @IsNumber()
  errorChatId: number;
  @IsNumber()
  debugChatId: number;
  @IsNumber()
  authChatId: number;
  @IsNumber()
  accessChatId: number;
  @IsNumber()
  adminChatId: number;

  /**
   * ======================
   * Данные для авторизации
   */
  @IsNumber()
  appId: number;
  @IsString()
  serviceKey: string;
}

export function envValidation(): IEnvironment {
  const config = getEnvConfig();
  const validatedConfig = plainToClass(Environment, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(
      `The Environment variables are not correct: ${errors.toString()}`,
    );
  }
  return validatedConfig;
}
