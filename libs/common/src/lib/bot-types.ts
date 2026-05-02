export interface BotChat {
  id: number;
  title: string;
  photo?: string;
  membersCount?: number;
}

export interface BotUser {
  id: number;
  firstName: string;
  lastName?: string;
  username?: string;
  photo?: string;
  mention?: string;
}

export interface BotChatList {
  count: number;
  items: BotChat[];
}

export interface BotChatMembers {
  count: number;
  items: BotUser[];
}
