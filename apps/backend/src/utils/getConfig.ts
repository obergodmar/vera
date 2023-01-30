import { Config } from '@vera-reforged/common';

import { readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';

const filePath = `${homedir()}/vera.json`;

export function getConfig(): Config {
  try {
    const fileContent = readFileSync(filePath, 'utf-8');

    return JSON.parse(fileContent) as Config;
  } catch (e) {
    console.error(e);
  }
}

export function writeConfig(config: Config): boolean {
  try {
    writeFileSync(filePath, JSON.stringify(config));

    return true;
  } catch {
    return false;
  }
}
