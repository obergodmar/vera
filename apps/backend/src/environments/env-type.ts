import { IAPIOptions, IUpdatesOptions } from 'vk-io';

export interface IEnvironment {
  /**
   * ===================
   * Настройки окружения
   */

  /**
   * Если бот запущен в продакшне
   */
  isProd: boolean;
  /**
   * Отключает ответы бота в чат, но сам функционал не отключается.
   * То есть если true, то метод отправки сообщений бота не вызывается.
   */
  disableBotListener: boolean;
  /**
   * Адрес для app.listen
   */
  address: string;
  /**
   * Порт для app.listen
   */
  port: number;
  /**
   * Уникальная строка для сессий
   */
  secret: string;
  /**
   * Настройки подключения к базе данных
   * mysql
   */
  dbHost: string;
  dbPort: number;
  dbName: string;
  dbUsername: string;
  dbPassword: string;

  redisUrl: string;

  trustProxy: string;

  /**
   * ==================
   * Настройки апи бота
   */

  /**
   * Токен апи бота
   */
  botToken: IAPIOptions['token'];
  botPollingGroupId: IUpdatesOptions['pollingGroupId'];
  botApiMode: IAPIOptions['apiMode'];

  /**
   * =================
   * Настройки админки
   */
  /**
   * Айди чата, в котором меняются настройки для бота.
   */
  settingsChatId: number;
  /**
   * Айди чата, в который бот шлет дебаг сообщения.
   */
  debugChatId: number;
  /**
   * Айди чата, в который бот шлет сообщения об ошибках.
   */
  errorChatId: number;
  /**
   * Айди чата, в котором бот шлет сообщения об успешной авторизации.
   */
  authChatId: number;
  /**
   * Айди в чата, участники которого могут пользоваться админкой бота.
   */
  accessChatId: number;
  /**
   * Айди в чата, участники которого видят все чаты бота.
   */
  adminChatId: number;

  /**
   * ======================
   * Данные для авторизации
   */
  appId: number;
  redirectUri: string;
}
