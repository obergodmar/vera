export namespace IHelloMessages {
  export type Message = string;
  export type MessagePerChat = {
    chatId: number;
    message: Message;
  };
}
