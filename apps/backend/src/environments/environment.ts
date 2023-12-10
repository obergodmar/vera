import { IEnvironment } from './env-type';

export const environment: IEnvironment = {
  isProd: false,
  disableBotListener: true,
  authorizationToken:
    'REMOVED_AUTH_TOKEN',
  botToken:
    'REMOVED_BOT_TOKEN',
  botPollingGroupId: 900028,
  botApiMode: 'parallel',
  settingsChatId: 2e9 + 60,
  debugChatId: 2e9 + 61,
  errorChatId: 2e9 + 62,
};
