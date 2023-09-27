import { IAPIOptions, IUpdatesOptions } from 'vk-io';

export interface IEnvironment {
  isProd: boolean;
  disableBotListener: boolean;
  authorizationToken: string;
  botToken: IAPIOptions['token'];
  botPollingGroupId: IUpdatesOptions['pollingGroupId'];
  botApiMode: IAPIOptions['apiMode'];
  settingsChatId: number;
  errorChatId: number;
  debugChatId: number;
}
