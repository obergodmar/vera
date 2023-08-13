export namespace IReactions {
  export type Reaction = string;
  export type Trigger = string;
  export type ChatReaction = {
    id: number;
    chatId: number;
    reaction: Reaction;
    textTrigger: Trigger;
    enabled: boolean;
  };
}
