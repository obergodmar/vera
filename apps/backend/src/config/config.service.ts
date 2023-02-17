import { Inject, Injectable } from '@nestjs/common';
import { Draft } from '@reduxjs/toolkit';
import { ConfigModel, IConfig } from '@vera-reforged/common';

import { plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';
import produce from 'immer';
import { readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';

import { LoggerService } from '../logger/logger.service';
import { initialConfig } from './initial-config';

const filePath = `${homedir()}/vera.json`;

@Injectable()
export class ConfigService {
  private config: IConfig.IConfig;
  constructor(@Inject(LoggerService) private readonly logger: LoggerService) {
    try {
      this.config = readConfig();
    } catch (e) {
      logger.log(`ConfigService: ${filePath} doesn't exist or is invalid`, {
        type: 'error',
      });

      this.config = initialConfig;
    }
  }

  public getConfig() {
    return this.config;
  }

  public updateConfig(recipe: (config: Draft<IConfig.IConfig>) => void) {
    const newConfig = produce(this.config, recipe);

    this.writeConfig(newConfig);
  }

  private writeConfig(newConfig: IConfig.IConfig): true | string {
    try {
      writeConfig(newConfig);

      this.logger.log('ConfigService: config file was updated');

      this.config = newConfig;

      return true;
    } catch (e) {
      const errorText = JSON.stringify(e);

      this.logger.log(`ConfigService: ${errorText}`, { type: 'error' });

      return errorText;
    }
  }
}

function readConfig() {
  const fileContent = readFileSync(filePath, 'utf-8');

  return validateConfig(JSON.parse(fileContent));
}

function writeConfig(config: IConfig.IConfig) {
  const validatedConfig = validateConfig(config);

  writeFileSync(filePath, JSON.stringify(validatedConfig));
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
