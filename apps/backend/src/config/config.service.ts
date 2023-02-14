import { Injectable } from '@nestjs/common';
import { ConfigModel, IConfig } from '@vera-reforged/common';

import { plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';

import { initialConfig } from './initial-config';

const filePath = `${homedir()}/vera.json`;

@Injectable()
export class ConfigService {
  private config: IConfig.IConfig;
  constructor() {
    try {
      const fileContent = readFileSync(filePath, 'utf-8');

      this.config = validateConfig(JSON.parse(fileContent));
    } catch (e) {
      console.error(`${filePath} doesn't exist or is invalid`);

      this.config = initialConfig;
    }
  }

  public getConfig() {
    try {
      return readConfig();
    } catch (e) {
      return initialConfig;
    }
  }
}

function readConfig() {
  const fileContent = readFileSync(filePath, 'utf-8');

  return JSON.parse(fileContent) as IConfig.IConfig;
}

export function validateConfig(config: object): IConfig.IConfig {
  const validatedConfig = plainToClass(ConfigModel, config, {
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
