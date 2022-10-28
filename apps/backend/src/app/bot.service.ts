import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { HearManager } from '@vk-io/hear';

import { CronJob } from 'cron';
import { Model } from 'mongoose';
import { ContextDefaultState, MessageEventContext, VK } from 'vk-io';
import * as Params from 'vk-io/lib/api/schemas/params';

import {
  Greeting,
  GreetingDocument,
} from '../greeting/schemes/greeting.schema';
import { Meeting, MeetingDocument } from '../meeting/schemes/meeting.schema';

type BotMessageOptions = {
  keyboard?: Record<string, any>;
  replyMsgId?: number;
};

@Injectable()
export class BotService {
  private readonly vk: VK;
  private readonly bot: HearManager<any>;
  private readonly cronJobs: Map<string, CronJob> = new Map();

  private readonly reactions: Record<string, string> = {
    messageForWebMessengerMeet:
      '@all Дорогие веб-котики, подключайтесь на флуд и дейли митинг. Для присоединения нажмите на кнопку звонка ' +
      'в шапке беседы. ',
    messageForFoldersMeet:
      '@all Дорогие котики, настало время митинга Daddy team',
    messageForChannelsMeet:
      '@all Дорогие котики! Настало время митинга каналов',
    messageForBubbleTeam:
      '@all Дорогие котики! Настало время синка Bubble Team!',
    messageForProductMeet:
      '@all Дорогие коллеги, присоединяйтесь к продуктовой встрече',
    messageForQAMeet:
      '@all Дорогие котики, спасители мессенджера, несгибаемый оплот качества, присоединяйтесь к ' +
      ' QA митингу.',

    reactionForLink: 'Полезные ссылки',
    reactionForWebBugs: '@chizublyat нужно посмотреть и завести',
    reactionForBackBugs: '@testromantest нужен ответ',
    reactionForAndroidBugs: '@zzz нужно посмотреть и завести',
    reactionForIosBugs: '@white_serj Нужно посмотреть и завести',
    reactionForHelpIos: '@ep великая сила Core IOS, призываю тебя на помощь!',
    reactionForHelpAndroid:
      '@abv Здравствуйте. Хотелось бы попросить Вас, если можно, о небольшой помощи команде мессенджера.',

    messageForReviewMeet: '@all Дорогие котики! Пора на ревью Дарья',
    messageForBrainsButtons:
      'Доброе утро, дорогие котики. По ссылкe можно выбрать мелкий баг для ' +
      'переключения. Хорошего продуктивного дня!',
    messageInviteToWebChat:
      'Привет. Добро пожаловать! Это чат основной коммуникации внутри команды веб-мессенджера. Также ' +
      'в этом чате происходят ежедневные синки в 12.30',
    messageInviteToFeatureTeamChat:
      'Привет. Это основной чат коммуникации между командами мессенджера о разрабатываемых ' +
      'продуктах.',
    messageInviteToProductMeet:
      'Привет. В этом чате в один из дней месяца проходит продуктовая встреча на которой ' +
      'обсуждаются планируемые продукты и итоги запусков',
    messageInviteToBugChat:
      'Привет. Это чат репортов по вебу, бекенду и андроиду',
    messageInviteToBugWebChat:
      'Привет. Это чат репортов о багах внутри команды веб-мессенджера',
    messageInviteToQAChat:
      'Привет. Это чат взаимодействия QA мессенджера web-a, backend-a и iOS.  Здесь мы обсуждаем задачи и ' +
      'ежедневно в 15.00 проводим синки по таскам на 15 минут',
  };

  private readonly chatsWithCommands = [
    900002, 900005, 900003, 900035, 900008, 900025, 900004,
    900026, 900009, 900012, 900001, 900033, 900007, 900013,
    900027, 900015, 900029, 900039, 900030, 2000010042,
    2000010044, 2000010047, 2000010041, 2000010046, 2000010048, 2000010049,
    900040,
  ];

  private readonly botsCredentials = {
    pestrusha:
      'https://internal.example.com/removed',
    benedict:
      'https://internal.example.com/removed',
    saveliy:
      'https://internal.example.com/removed',
    leSha:
      'https://internal.example.com/removed',
    messReq:
      'https://internal.example.com/removed',
    numberBot:
      'https://internal.example.com/removed',
  };

  constructor(
    @InjectModel(Greeting.name)
    private readonly greetingModel: Model<GreetingDocument>,
    @InjectModel(Meeting.name)
    private readonly meetingModel: Model<MeetingDocument>
  ) {
    this.vk = new VK({
      token: process.env.BOT_TOKEN,
      pollingGroupId: 900028,
      apiMode: 'parallel',
    });

    this.bot = new HearManager();
  }

  public createCronJob(time: Date, peerId: number, message: string) {
    const id = `${Math.random()}`;

    const job = new CronJob(
      time,
      () => {
        const parameters = createMessage(peerId, message);

        this.vk.api.messages.send(parameters);
      },
      () => {
        this.cronJobs.delete(id);
      },
      true,
      'Europe/Moscow'
    );

    this.cronJobs.set(id, job);

    return id;
  }

  public cancelCronJob(cronId: string) {
    this.cronJobs.get(cronId)?.stop();
    this.cronJobs.delete(cronId);
  }

  private handleChatJoin() {
    this.vk.updates.on('chat_invite_user', async (context) => {
      const { peerId } = context;

      try {
        const greeting = await this.greetingModel.findOne({ peerId }).exec();

        if (greeting.text) {
          const parameters = createMessage(peerId, greeting.text);

          this.vk.api.messages.send(parameters);
        }
      } catch (e: unknown) {
        console.error(e);
      }
    });
  }

  private react(regExp: RegExp, message, { keyboard }: BotMessageOptions = {}) {
    this.bot.hear(regExp, (msg) => {
      const parameters = createMessage(msg.peerId, message, { keyboard });

      this.vk.api.messages.send(parameters);
    });
  }

  private reactOnCreating() {
    this.bot.hear(
      /Был. создан. (?<type>.+) с идентификатором (?<id>.+)/,
      (msg) => {
        const { $match, peerId } = msg;

        const meetingId = $match?.groups?.id;
        const type = $match?.groups?.type;

        if (!meetingId || !type) {
          return;
        }

        const parameters = createMessage(peerId, 'Готово!');

        setTimeout(async () => {
          this.vk.api.messages.send(parameters);

          if (type === 'встреча') {
            const result = await this.meetingModel
              .findOne({ meetings: { $elemMatch: { id: meetingId } } })
              .exec();

            if (result?.meetings?.[0].title) {
              const { title, inviteText } = result.meetings[0];

              const parameters = createMessage(
                peerId,
                `Успешно создано:\n${title}: ${inviteText}`
              );

              this.vk.api.messages.send(parameters);
            }
          }

          if (type === 'приветствие') {
            const result = await this.greetingModel
              .findOne({ id: meetingId })
              .exec();

            console.log(result);

            if (result?.text) {
              const parameters = createMessage(
                peerId,
                `Успешно создано:\n${result?.text}`
              );

              this.vk.api.messages.send(parameters);
            }
          }
        }, 300);
      }
    );
  }

  private createReactionQueue() {
    this.react(
      /(#web|#re|#me|#dm|#com_m|#mvk|#vkui)/i,
      this.reactions.reactionForWebBugs
    );
    this.react(/(#backend)/, this.reactions.reactionForBackBugs);
    this.react(/(#android)/, this.reactions.reactionForAndroidBugs);
    this.react(/(#helpios)/i, this.reactions.reactionForHelpIos);
    this.react(/(#helpandroid)/i, this.reactions.reactionForHelpAndroid);
  }

  private executeCommand(
    regExp: RegExp,
    {
      text,
      keyboard,
    }: {
      text: string;
      keyboard?: Record<string, any>;
    }
  ) {
    const isBotsCommand = text === 'Выбирай любого';

    this.bot.hear(regExp, (msg) => {
      if (msg.peerId > 2e9 && !isBotsCommand) {
        return;
      }

      let parameters: Params.MessagesSendParams;

      if (this.chatsWithCommands.includes(msg.peerId) || isBotsCommand) {
        parameters = createMessage(msg.peerId, text, { keyboard });
      } else {
        parameters = createMessage(msg.peerId, 'Нет');
      }

      this.vk.api.messages.send(parameters);
    });
  }

  private createCommandsQueue() {
    this.executeCommand(/Начать/, {
      text: 'Но я тысячи раз обрывал провода, \nСам себе кричал: Наши боты, полезные ссылки, таски в спринтах и для дейли',
      keyboard: {
        type: 'keyboard',
        content: {
          inline: true,
          buttons: [
            [
              addButton('text', ' -боты', 'positive'),
              addButton('text', ' /Ссылки', 'positive'),
              addButton('text', ' /Мне', 'positive'),
            ],
            [addButton('text', ' /QA', 'positive')],
          ],
        },
      },
    });
    this.executeCommand(/\/Убрать кнопки/, {
      text: 'Клавиатура очищена',
      keyboard: {
        type: 'keyboard',
        content: {
          one_time: false,
          buttons: [],
        },
      },
    });
    this.executeCommand(/\/Ссылки/i, {
      text:
        'Диаграмма Ганта - таймлайн команды на ближайшее будущее\n' +
        'Kanban Board - Канбан-доска команды,\n' +
        'Backlog - бэклог команды, планы',
      keyboard: {
        type: 'keyboard',
        content: {
          one_time: false,
          buttons: [
            [
              addButtonWithLink(
                'https://internal.example.com/removed',
                'Диаграмма Гантта'
              ),
            ],
            [
              addButtonWithLink(
                'https://internal.example.com/removed',
                'Kanban Board'
              ),
            ],
            [
              addButtonWithLink(
                'https://internal.example.com/removed',
                'Чеклисты Allure'
              ),
            ],
            [
              addButtonWithLink(
                'https://internal.example.com/removed',
                'Что с автоматизацией'
              ),
            ],
            [addButton('text', '/Убрать кнопки', 'positive')],
          ],
        },
      },
    });
    this.executeCommand(/\/Мне/i, {
      text: 'Ссылки на Гантта, таски и свои дела для дейли',
      keyboard: {
        type: 'keyboard',
        content: {
          inline: true,
          buttons: [
            [
              addButtonWithLink(
                'https://internal.example.com/removed',
                'Мои таски в спринте'
              ),
            ],
            [
              addButtonWithLink(
                'https://internal.example.com/removed',
                'Мои таски в плане по Гантту'
              ),
            ],
            [
              addButtonWithLink(
                'https://internal.example.com/removed',
                'Что я делал вчера и сегодня'
              ),
            ],
            [
              addButtonWithLink(
                'https://internal.example.com/removed',
                'Мои таски в будущих спринтах'
              ),
            ],
          ],
        },
      },
    });

    //QA
    this.executeCommand(/\/QA/i, {
      text: 'Полезное для QA',
      keyboard: {
        type: 'keyboard',
        content: {
          inline: true,
          buttons: [
            [
              addButton('text', ' /WEB_QA', 'positive'),
              addButton('text', ' /Автоматизация', 'positive'),
              addButton('text', ' /Общее', 'positive'),
            ],
            [
              addButton('text', ' /Чеклисты', 'positive'),
              addButton('text', ' /AllureTestops_Guide', 'positive'),
            ],
          ],
        },
      },
    });
    this.executeCommand(/\/WEB_QA/i, {
      text: 'Полезное для QA',
      keyboard: {
        type: 'keyboard',
        content: {
          inline: true,
          buttons: [
            [
              addButtonWithLink(
                'https://internal.example.com/removed',
                'Я QA в Мессенджере. Что делать?'
              ),
            ],
            [addButtonWithLink('https://internal.example.com/removed', 'QA Tools')],
            [
              addButtonWithLink(
                'https://internal.example.com/removed',
                'Дашборд'
              ),
            ],
            [
              addButtonWithLink(
                'https://internal.example.com/removed',
                'Где мои задачи?'
              ),
            ],
          ],
        },
      },
    });
    this.executeCommand(/\/Автоматизация/i, {
      text: 'Что там с автотестами',
      keyboard: {
        type: 'keyboard',
        content: {
          inline: true,
          buttons: [
            [
              addButtonWithLink(
                'https://internal.example.com/removed',
                'Эпик по автоматизации'
              ),
            ],
            [
              addButtonWithLink(
                'https://internal.example.com/removed',
                'Что и где гоняется'
              ),
            ],
            [
              addButtonWithLink(
                'https://internal.example.com/removed',
                'Флоу работы с автотестами и с Core QA'
              ),
            ],
          ],
        },
      },
    });
    this.executeCommand(/\/Чеклисты/i, {
      text: 'Чеклисты и тесткейсы',
      keyboard: {
        type: 'keyboard',
        content: {
          inline: true,
          buttons: [
            [
              addButtonWithLink(
                'https://internal.example.com/removed',
                'Чеклисты Allure TestOps'
              ),
            ],
            [
              addButtonWithLink(
                'https://internal.example.com/removed',
                'Тесткейсы на автоматизацию'
              ),
            ],
            [
              addButtonWithLink(
                'https://internal.example.com/removed',
                'Кейсы автотестов в Allure TestOps'
              ),
            ],
          ],
        },
      },
    });
    this.executeCommand(/\/Общее/i, {
      text: 'Планы,  и коммуникация',
      keyboard: {
        type: 'keyboard',
        content: {
          inline: true,
          buttons: [
            [
              addButtonWithLink(
                'https://internal.example.com/removed',
                'Текущие планы и договоренности'
              ),
              addButtonWithLink(
                'https://internal.example.com/removed',
                'Как завести отчет'
              ),
            ],
            [
              addButtonWithLink(
                'https://internal.example.com/removed',
                'Workflow бага в Jira'
              ),
              addButtonWithLink(
                'https://internal.example.com/removed',
                'Чеклист тестирования задачи'
              ),
            ],
            [
              addButtonWithLink(
                'https://internal.example.com/removed',
                'Тестовые инструменты'
              ),
              addButtonWithLink(
                'https://internal.example.com/removed',
                'Полезные заметки'
              ),
            ],
            [
              addButtonWithLink(
                'https://internal.example.com/removed',
                'Страница QA в Conf'
              ),
            ],
          ],
        },
      },
    });
    this.executeCommand(/\/AllureTestops_Guide/i, {
      text: 'Как написать чеклист',
      keyboard: {
        type: 'keyboard',
        content: {
          inline: true,
          buttons: [
            [
              addButtonWithLink(
                'https://internal.example.com/removed',
                'Гайд написания чеклистов в Allure'
              ),
            ],
          ],
        },
      },
    });

    this.executeCommand(/-боты/i, {
      text: 'Выбирай любого',
      keyboard: {
        type: 'template',
        content: {
          type: 'carousel',
          elements: [
            addButtonWithCarousel(
              'Пеструша',
              'Пеструша Пестрокрылышкин',
              'Пеструша',
              900036
            ),
            addButtonWithCarousel(
              'Benedict',
              'Бенедикт Кембербетч Иванович',
              'Бенедикт',
              900038
            ),
            addButtonWithCarousel(
              'Савелий',
              'Савелий Август-Германик',
              'Савелий',
              900037
            ),
            addButtonWithCarousel('Le Sha', 'Le Sha', 'LeSha', 900031),
            addButtonWithCarousel('Mess Req', 'Mess Req', 'MessReq', 900034),
            addButtonWithCarousel(
              '12345...',
              'Числобот',
              '900006',
              900032
            ),
          ],
        },
      },
    });

    this.vk.updates.on('message_event', (context) => {
      this.getBot(context, 'Пеструша', this.botsCredentials.pestrusha);
      this.getBot(context, 'Бенедикт', this.botsCredentials.benedict);
      this.getBot(context, 'Савелий', this.botsCredentials.saveliy);
      this.getBot(context, 'LeSha', this.botsCredentials.leSha);
      this.getBot(context, 'MessReq', this.botsCredentials.messReq);
      this.getBot(context, '900006', this.botsCredentials.numberBot);
    });
  }

  private getBot(
    context: MessageEventContext<ContextDefaultState>,
    name: string,
    botCredentials: string
  ) {
    if (context.eventPayload.text !== name) {
      return;
    }

    let parameters: Params.MessagesSendParams;

    this.vk.api.messages.sendMessageEventAnswer({
      event_id: context.eventId,
      peer_id: context.peerId,
      conversation_message_ids: context.conversationMessageId,
      user_id: context.userId,
      event_data: JSON.stringify({ type: 'show_snackbar', text: 'Ok' }),
    });
    if (
      [
        900002, 900005, 900003, 900035, 900008, 900025, 900004,
        900026, 900009, 900012, 900001, 900033, 900007, 900013,
        900027, 900015, 900029, 900039, 900030, 900040,
      ].includes(context.userId)
    ) {
      parameters = createMessage(
        context.peerId,
        'Вот твой ботик, котик\n' + '\n' + botCredentials
      );
    } else {
      parameters = createMessage(
        context.peerId,
        'Не пытайся меня одурачить, золотце, это не твои боты'
      );
    }

    this.vk.api.messages.send(parameters);
  }

  public async start() {
    console.log('Bot has started');

    try {
      this.vk.updates.on('message_new', this.bot.middleware);

      this.handleChatJoin();

      this.createCommandsQueue();
      this.createReactionQueue();

      this.reactOnCreating();

      await this.vk.updates.startPolling();
    } catch (e: unknown) {
      console.error(e);
    }
  }
}

function createMessage(
  peer_id: number,
  message: string,
  { keyboard, replyMsgId }: BotMessageOptions = {}
) {
  const parameters: Params.MessagesSendParams = {
    peer_id,
    message,
    random_id: 0,
  };

  if (keyboard) {
    parameters[keyboard.type] = JSON.stringify(keyboard.content);
  }

  if (replyMsgId) {
    parameters.forward = JSON.stringify({
      peer_id,
      conversation_message_ids: replyMsgId,
      is_reply: true,
    });
  }

  return parameters;
}

function addButton(type: string, label: string, color: string) {
  return {
    action: {
      type: type,
      label: label,
    },
    color: color,
  };
}

function addButtonWithLink(link: string, label: string) {
  return {
    action: {
      type: 'open_link',
      link: link,
      label: label,
    },
  };
}

function addButtonWithCarousel(
  title: string,
  description: string,
  label: string,
  id: number
) {
  return {
    title: title,
    description: description,
    action: {
      type: 'open_link',
      link: 'https://vk.com/' + 'id' + id,
    },
    buttons: [
      {
        action: {
          type: 'callback',
          label: label,
          payload: '{"type":"show_snackbar","text": "' + label + '"}',
        },
      },
    ],
  };
}
