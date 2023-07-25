export namespace IReactions {
  export type Reaction = string;
  export type Trigger = string;
  export type ChatReaction = {
    chatId: number;
    reaction: Reaction;
    textTrigger: Trigger;
  };
}
