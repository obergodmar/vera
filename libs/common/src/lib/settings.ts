export namespace ISettings {
  export type Item = {
    opt: string;
    val: string;
  };

  export type Option = 'debug_log_to_vk' | 'convos_fetch_amount';
  export type ValueByOption = {
    debug_log_to_vk: boolean;
    convos_fetch_amount: number;
  };
}

export const defaultSettings: ISettings.ValueByOption = {
  debug_log_to_vk: true,
  convos_fetch_amount: 100,
};
