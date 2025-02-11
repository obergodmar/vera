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
  secret: '',
  dbHost: 'localhost',
  dbPort: 3306,
  dbName: '',
  dbUsername: '',
  dbPassword: '',
  redisUrl: '',
  trustProxy: '',

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
  settingsChatId: 0,
  debugChatId: 0,
  errorChatId: 0,
  authChatId: 0,
  accessChatId: 0,
  adminChatId: 0,

  /**
   * ======================
   * Данные для авторизации
   */
  appId: 0,
  redirectUri: "http://localhost/login",
};
