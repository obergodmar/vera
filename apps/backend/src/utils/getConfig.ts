import { Config } from '@vera-reforged/common';

import { writeFileSync } from 'node:fs';
import { homedir } from 'node:os';

const filePath = `${homedir()}/vera.json`;

export async function getConfig(): Promise<Config> {
  return (await import(filePath)) as Config;
}

export function writeConfig(config: Config): boolean {
  try {
    writeFileSync(filePath, JSON.stringify(config));

    return true;
  } catch {
    return false;
  }
}
