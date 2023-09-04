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
  @IsBoolean()
  isProd: boolean;

  @IsBoolean()
  disableBotListener: boolean;

  @IsString()
  @IsNotEmpty()
  authorizationToken: string;

  @IsString()
  @IsNotEmpty()
  botToken: string;

  @IsNumber()
  botPollingGroupId: number;

  @IsString()
  @IsNotEmpty()
  botApiMode: 'sequential' | 'parallel' | 'parallel_selected';
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
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
