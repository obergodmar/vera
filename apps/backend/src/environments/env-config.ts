import { DeepPartial, mergeObject } from '@vera-reforged/common';

import * as dotenv from 'dotenv';

import { IEnvironment } from './env-type';

const environment: IEnvironment = {
  isProd: false,
  disableBotListener: false,
  address: '127.0.0.1',
  port: 4256,
  dbHost: 'localhost',
  dbPort: 3306,
  dbName: '',
  dbUsername: '',
  dbPassword: '',

  botToken: '',
  botPollingGroupId: 0,
  botApiMode: 'parallel',

  authorizationToken: '',
  settingsChatId: 0,
  debugChatId: 0,
  errorChatId: 0,
};

export function getEnvConfig(): IEnvironment {
  const envVariables = parseEnvVariables();
  return mergeObject(environment, envVariables);
}

function parseEnvVariables(): Partial<IEnvironment> {
  const envVariables: DeepPartial<IEnvironment> = {};

  dotenv.config();
  const env = process.env;

  if (!env) {
    return envVariables;
  }

  /**
   * ===================
   * Настройки окружения
   */
  if (env.IS_PROD) {
    envVariables.isProd = !!env.IS_PROD;
  }
  if (env.DISABLE_BOT_LISTENER) {
    envVariables.disableBotListener = !!env.DISABLE_BOT_LISTENER;
  }
  if (env.ADDRESS) {
    envVariables.address = env.ADDRESS;
  }
  if (env.PORT) {
    envVariables.port = parseInt(env.PORT);
  }
  if (env.DB_HOST) {
    envVariables.dbHost = env.DB_HOST;
  }
  if (env.DB_PORT) {
    envVariables.dbPort = parseInt(env.DB_PORT);
  }
  if (env.DB_NAME) {
    envVariables.dbName = env.DB_NAME;
  }
  if (env.DB_USERNAME) {
    envVariables.dbUsername = env.DB_USERNAME;
  }
  if (env.DB_PASSWORD) {
    envVariables.dbPassword = env.DB_PASSWORD;
  }

  /**
   * ==================
   * Настройки апи бота
   */
  if (env.BOT_TOKEN) {
    envVariables.botToken = env.BOT_TOKEN;
  }
  if (env.BOT_POLLING_GROUP_ID) {
    envVariables.botPollingGroupId = parseInt(env.BOT_POLLING_GROUP_ID, 10);
  }
  if (env.BOT_API_MODE) {
    envVariables.botApiMode = parseBotApiMode(env.BOT_API_MODE);
  }

  /**
   * =================
   * Настройки админки
   */
  if (env.AUTHORIZATION_TOKEN) {
    envVariables.authorizationToken = env.AUTHORIZATION_TOKEN;
  }
  if (env.SETTINGS_CHAT_ID) {
    envVariables.settingsChatId = parseInt(env.SETTINGS_CHAT_ID);
  }
  if (env.DEBUG_CHAT_ID) {
    envVariables.debugChatId = parseInt(env.DEBUG_CHAT_ID);
  }
  if (env.ERROR_CHAT_ID) {
    envVariables.errorChatId = parseInt(env.ERROR_CHAT_ID);
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
