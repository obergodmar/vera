import { Inject, Injectable } from '@nestjs/common';
import { Draft } from '@reduxjs/toolkit';
import { ConfigModel, IConfig, sleep } from '@vera-reforged/common';

import { plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';
import produce from 'immer';
import { readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { check, lock, unlockSync } from 'proper-lockfile';

import { LoggerService } from '../logger/logger.service';
import { initialConfig } from './initial-config';

const filePath = `${homedir()}/vera.json`;

@Injectable()
export class ConfigService {
  private config: IConfig.IConfig;
  constructor(@Inject(LoggerService) private readonly logger: LoggerService) {
    try {
      logger.log('ConfigService: Checking if Lock exists');
      unlockSync(filePath);

      logger.log(`ConfigService: Unlock ${filePath}`);
    } catch {
      logger.log(`ConfigService: Lock file doesn't exists`);
    }

    try {
      this.config = readConfig();
      logger.log(`ConfigService: ${filePath} was loaded successfully`);
    } catch (e) {
      logger.log(
        `ConfigService: ${filePath} doesn't exist or is invalid: ${e}`,
        {
          type: 'error',
        }
      );

      this.config = initialConfig;
    }
  }

  public getConfig() {
    return this.config;
  }

  public async updateConfig(
    recipe: (config: Draft<IConfig.IConfig>) => void
  ): Promise<true | string> {
    const newConfig = produce(this.getConfig(), recipe);

    try {
      const validConfig = validateConfig(newConfig);

      return this.writeConfig(validConfig);
    } catch (e: unknown) {
      this.logger.log("ConfigService: config didn't passed checks", {
        type: 'error',
      });
      this.logger.log(`ConfigService: config is invalid!, ${e}`, {
        type: 'error',
      });

      return 'Invalid config';
    }
  }

  private async writeConfig(
    newConfig: IConfig.IConfig
  ): Promise<true | string> {
    try {
      const isLocked = await check(filePath);

      if (isLocked) {
        this.logger.log('ConfigService: config is locked. Awaiting 500ms');
        await sleep(500);

        return this.writeConfig(newConfig);
      }

      const release = await lock(filePath);
      this.logger.log('ConfigService: lock config file for an update');

      writeConfig(newConfig);
      this.config = newConfig;

      this.logger.log('ConfigService: config file was updated');

      release();
      this.logger.log('ConfigService: unlock config file');

      return true;
    } catch (e) {
      const errorText = JSON.stringify(e);

      this.logger.log(`ConfigService: ${errorText}`, { type: 'error' });
      this.logger.log('ConfigService: unlock config file due to an error');
      try {
        unlockSync(filePath);
      } catch {
        this.logger.log("ConfigService: lock file doesn't exists ");
      }

      return errorText;
    }
  }
}

function readConfig() {
  const fileContent = readFileSync(filePath, 'utf-8');

  return validateConfig(JSON.parse(fileContent));
}

function writeConfig(config: IConfig.IConfig) {
  const configAsString = JSON.stringify(config);

  writeFileSync(filePath, configAsString);
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

  return config as IConfig.IConfig;
}
