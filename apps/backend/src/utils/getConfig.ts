import { Config } from '@vera-reforged/common';

export async function getConfig(): Promise<Config> {
  return (await import('../assets/config.json')) as Config;
}
