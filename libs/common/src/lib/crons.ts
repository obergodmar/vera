export namespace ICrons {
  export type Day = {
    shortName: string;
    name: string;
    nameWhen: string;
    dayNumber: number;
  };

  export type ChatCron = {
    id: number;
    message: string;
    chatId: number;
    daysRange: string;
    timeAt: string;
    enabled: boolean;
  };
}
