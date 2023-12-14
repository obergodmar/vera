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
    buttons: string;
    startDate: number;
    /**
     * 0 - Каждую неделю
     * 1 - Раз в месяц
     * 2 - Через неделю
     * 3 - Через две недели
     */
    repeat: number;
    enabled: boolean;
  };
}
