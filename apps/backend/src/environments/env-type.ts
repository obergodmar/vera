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
   * Настройки подключения к базе данных
   * mysql
   */
  dbHost: string;
  dbPort: number;
  dbName: string;
  dbUsername: string;
  dbPassword: string;

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
   * Токен авторизации для админки.
   * TODO: сделать его рандомным
   */
  authorizationToken: string;

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
}
