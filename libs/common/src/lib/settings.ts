export namespace ISettings {
  export type Item = {
    opt: Option;
    val: string;
  };

  export type Option = 'debug_log_to_vk';
}
