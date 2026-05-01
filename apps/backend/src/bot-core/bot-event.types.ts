export interface IBotMessageEvent {
  peerId: number;
  text: string | null;
  fromId: number;
  conversationMessageId: number;
  backend: 'vk' | 'telegram';
}

export interface IBotInviteEvent {
  peerId: number;
  memberId: number;
  backend: 'vk' | 'telegram';
}

export interface IBotSendOptions {
  replyToConversationMessageId?: number;
}
