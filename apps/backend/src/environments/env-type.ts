import { IAPIOptions, IUpdatesOptions } from "vk-io";

export interface IEnvironment {
  isProd: boolean;
  disableBotListener: boolean;
  botToken: IAPIOptions['token'];
  botPollingGroupId: IUpdatesOptions['pollingGroupId'];
  botApiMode: IAPIOptions['apiMode']
}
