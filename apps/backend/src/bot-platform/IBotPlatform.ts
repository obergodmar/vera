import {
  BotChatList,
  BotChatMembers,
  BotUser,
  IApi,
  IKeyboard,
} from '@vera-reforged/common';

export const BOT_PLATFORM_TOKEN = 'BOT_PLATFORM_TOKEN';

export interface IBotSendOptions {
  replyToMessageId?: number;
  linkButtons?: IKeyboard.LinkButton[];
}

export interface IBotPlatform {
  readonly platform: 'vk' | 'telegram';
  sendMessage(
    peerId: number,
    text: string,
    opts?: IBotSendOptions,
  ): Promise<void>;
  getChats(userId: number): Promise<BotChatList>;
  getChatMembers(chatId: number): Promise<BotChatMembers>;
  getUsers(userIds: number[]): Promise<BotUser[]>;
  isMember(chatId: number, userId: number): Promise<boolean>;
  authorizeUser(
    data: IApi.IAuthApi.VkAuthData | IApi.IAuthApi.TelegramAuthData,
  ): Promise<{ user: BotUser; token: string } | null>;
  validateToken(token: string, userId: number): Promise<boolean>;
}
