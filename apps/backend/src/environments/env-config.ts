import { DeepPartial, mergeObject } from '@vera-reforged/common';

import { IEnvironment } from './env-type';
import { environment } from './environment';

export function getEnvConfig(): IEnvironment {
  const envVariables = parseEnvVariables();
  return mergeObject(environment, envVariables);
}

function parseEnvVariables(): Partial<IEnvironment> {
  const envVariables: DeepPartial<IEnvironment> = {};
  const env = process.env;
  if (!env) {
    return envVariables;
  }

  if (env.IS_PROD) {
    envVariables.isProd = !!env.IS_PROD;
  }

  if (env.DISABLE_BOT_LISTENER) {
    envVariables.disableBotListener = !!env.DISABLE_BOT_LISTENER;
  }

  if (env.AUTHORIZATION_TOKEN) {
    envVariables.authorizationToken = env.AUTHORIZATION_TOKEN;
  }

  if (env.BOT_TOKEN) {
    envVariables.botToken = env.BOT_TOKEN;
  }

  if (env.BOT_POLLING_GROUP_ID) {
    envVariables.botPollingGroupId = parseInt(env.BOT_POLLING_GROUP_ID, 10);
  }

  if (env.BOT_API_MODE) {
    envVariables.botApiMode = parseBotApiMode(env.BOT_API_MODE);
  }

  if (env.SETTINGS_CHAT_ID) {
    envVariables.settingsChatId = parseInt(env.SETTINGS_CHAT_ID);
  }

  if (env.ERROR_CHAT_ID) {
    envVariables.errorChatId = parseInt(env.ERROR_CHAT_ID);
  }

  if (env.DEBUG_CHAT_ID) {
    envVariables.debugChatId = parseInt(env.DEBUG_CHAT_ID);
  }

  return envVariables;
}

function parseBotApiMode(opt: string): IEnvironment['botApiMode'] {
  switch (opt) {
    case 'sequential':
    case 'parallel':
    case 'parallel_selected':
      return opt;
    default:
      return 'parallel';
  }
}
