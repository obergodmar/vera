export namespace ICommands {
  export type CommandsNames = 'roll';

  export type Command = {
    id: number;
    chatId: number;
    command: CommandsNames;
    name?: string;
    enabled: boolean;
  };

  export type ChatCommand = {
    name: 'roll';
    nameExtra?: string;
    command: RollCommand;
    enabled: boolean;
  };

  export type RollCommand = {
    id: number;
    chatId: number;
    phrase: string;
    membersIds: string;
  };
}
