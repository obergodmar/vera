import { IEnvironment } from './env-type';

export const environment: IEnvironment = {
  /**
   * ===================
   * Настройки окружения
   */
  isProd: false,
  disableBotListener: true,
  address: '127.0.0.1',
  port: 4256,
  dbHost: 'localhost',
  dbPort: 3306,
  dbName: '',
  dbUsername: '',
  dbPassword: '',

  /**
   * ==================
   * Настройки апи бота
   */
  botToken: '',
  botPollingGroupId: 0,
  botApiMode: 'parallel',

  /**
   * =================
   * Настройки админки
   */
  authorizationToken: '',
  settingsChatId: 0,
  debugChatId: 0,
  errorChatId: 0,
};
