import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { IApi, ICrons, shouldCallCron } from '@vera-reforged/common';

import { CronJob } from 'cron';
import { Repository } from 'typeorm';
import { APIMessages } from 'vk-io/lib/api/schemas/methods';
import { MessagesSendParams } from 'vk-io/lib/api/schemas/params';

import { IEnvironment } from '../environments/env-type';
import { DebugService } from '../logger/debug.service';
import { LoggerService } from '../logger/logger.service';
import { VkApiService } from '../vk-api/vk-api.service';
import { CreateCronForChatDto, UpdateCronForChatDto } from './crons.dto';
import { Cron } from './crons.entity';

@Injectable()
export class CronsService {
  private cronJobs: Map<number, CronJob> = new Map();
  private readonly sendMessage: APIMessages['send'];
  private readonly logger: DebugService;

  public constructor(
    @InjectRepository(Cron)
    private readonly cronsRepository: Repository<Cron>,
    @Inject(VkApiService) private readonly api: VkApiService,
    @Inject(ConfigService) private readonly config: ConfigService,
    @Inject(LoggerService) loggerService: LoggerService,
  ) {
    this.logger = new DebugService(loggerService, this.constructor.name);

    const isListenerOff =
      this.config.get<IEnvironment['disableBotListener']>('disableBotListener');

    this.sendMessage = (params: MessagesSendParams) => {
      if (isListenerOff) {
        return;
      }

      return this.api.botService.vk.api.messages.send(params);
    };

    this.logger.debug('Crons initial load started');
    this.cronsRepository
      .find({
        where: { enabled: true },
      })
      .then((crons) => {
        crons.forEach((cron) => {
          this.cronJobs.set(
            cron.id,
            createCronJob(cron, this.sendMessage, this.logger),
          );
        });

        this.logger.debug(`${crons.length} cron jobs created`);
      })
      .catch((e) => {
        this.logger.error(`Crons initial load failed: ${e}`);
      });
  }

  public async getCronsForChat(
    chatId: number,
  ): Promise<IApi.ICronsApi.GetCronsForChatResponse> {
    this.logger.debug(`Crons were requested for chat ${chatId}`);

    try {
      const crons = await this.cronsRepository.find({
        where: { chatId },
      });

      return {
        count: crons.length,
        items: crons,
      };
    } catch (e) {
      this.logger.error(`Couldn't get crons for chat ${chatId}: ${e}`);

      return {
        count: 0,
        items: [],
      };
    }
  }

  public async getCronsChatsResponse(): Promise<IApi.ICronsApi.GetCronsChatsResponse> {
    this.logger.debug('Crons chats were requested');

    try {
      const cronsChats = await this.cronsRepository.find();

      this.logger.debug('Crons chats were sucessfully sent');

      return {
        count: cronsChats.length,
        items: cronsChats.map(({ chatId }) => chatId),
      };
    } catch (e) {
      this.logger.error(`Couldn't get cron chats: ${e}`);

      return {
        count: 0,
        items: [],
      };
    }
  }

  public async createCronForChat(
    cronCreationDto: CreateCronForChatDto,
  ): Promise<IApi.ICronsApi.CreateCronForChatResponse> {
    const {
      chatId,
      message,
      daysRange,
      timeAt,
      buttons,
      startDate,
      repeat,
      enabled,
    } = cronCreationDto;

    const logMeta = getCronLogMeta(cronCreationDto);
    this.logger.debug(`Creating cron ${logMeta}`);

    try {
      const res = await this.cronsRepository.insert({
        chatId,
        timeAt,
        enabled,
        message,
        daysRange,
        buttons,
        startDate,
        repeat,
      });

      const id = res.identifiers[0].id;

      this.cronJobs.set(
        id,
        createCronJob(
          {
            id,
            chatId,
            timeAt,
            enabled,
            message,
            daysRange,
            buttons,
            startDate,
            repeat,
          },
          this.sendMessage,
          this.logger,
        ),
      );
    } catch (e) {
      this.logger.error(`Couldn't create cron ${logMeta}: ${e}`);

      return {
        success: false,
        error: 'Ошибка записи в базу данных',
      };
    }

    return {
      success: true,
    };
  }

  public async updateCronForChat(
    cronUpdateDto: UpdateCronForChatDto,
  ): Promise<IApi.ICronsApi.UpdateCronForChatResponse> {
    const {
      id,
      chatId,
      message,
      daysRange,
      timeAt,
      buttons,
      startDate,
      repeat,
      enabled,
    } = cronUpdateDto;

    const isDeleting = !message || !daysRange || !timeAt;

    const logMeta = getCronLogMeta(cronUpdateDto);
    this.logger.debug(
      `${isDeleting ? 'Deleting' : 'Updating'} cron ${
        !isDeleting ? `${logMeta}` : `${id} for ${chatId}`
      }`,
    );

    try {
      if (this.cronJobs.has(id)) {
        this.cronJobs.get(id).stop();
        this.cronJobs.delete(id);
      }

      if (isDeleting) {
        await this.cronsRepository.delete({ id });
      } else {
        await this.cronsRepository.upsert(
          [
            {
              id,
              chatId,
              daysRange,
              timeAt,
              message,
              enabled,
              buttons,
              startDate,
              repeat,
            },
          ],
          ['id'],
        );

        if (enabled) {
          this.cronJobs.set(
            id,
            createCronJob(
              {
                id,
                chatId,
                daysRange,
                timeAt,
                message,
                enabled,
                buttons,
                startDate,
                repeat,
              },
              this.sendMessage,
              this.logger,
            ),
          );
        }
      }
    } catch (e) {
      this.logger.error(`Couldn't update cron ${id} in ${chatId}: ${e}`);
      return {
        error: 'Ошибка записи в базу данных',
        success: false,
      };
    }

    return {
      success: true,
    };
  }

  public async disableCronsForChat(
    chatId: number,
  ): Promise<IApi.ICronsApi.DisableCronsForChatResponse> {
    this.logger.debug(`Start disabling all crons for chat: ${chatId}`);

    try {
      const { items } = await this.getCronsForChat(chatId);
      const ids = items.map(({ id }) => id);
      const res = await this.cronsRepository.update(
        { chatId },
        { enabled: false },
      );

      this.cronJobs.forEach((job, id) => {
        if (ids.includes(id)) {
          job.stop();
          this.cronJobs.delete(id);
        }
      });

      this.logger.debug(`Successfully disabled all crons for chat: ${chatId}`);

      return {
        success: true,
        count: res.affected,
      };
    } catch (e) {
      this.logger.error(`Couldn't disable crons for chat: ${chatId}: ${e}`);

      return {
        success: false,
        error: 'Ошибка записи в базу данных',
      };
    }
  }

  public async disableAllCrons(): Promise<IApi.ICronsApi.DisableAllCronsResponse> {
    this.logger.debug('Start disabling all crons');

    try {
      const res = await this.cronsRepository.update({}, { enabled: false });

      this.logger.debug('Successfully disabled all crons ');

      this.cronJobs.forEach((job, id) => {
        job.stop();
        this.cronJobs.delete(id);
      });

      return {
        success: true,
        count: res.affected,
      };
    } catch (e) {
      this.logger.error(`Couldn't disable all crons: ${e}`);

      return {
        success: false,
        error: 'Ошибка записи в базу данных',
      };
    }
  }
}

function createCronJob(
  cron: ICrons.ChatCron,
  sendMessage: APIMessages['send'],
  logger: DebugService,
): CronJob {
  const { timeAt, chatId, daysRange, message, buttons, repeat, startDate } =
    cron;
  const [hours, minutes] = timeAt.split(':');

  let keyboard: string | undefined;

  if (buttons) {
    try {
      const { label, link } = JSON.parse(buttons)[0];

      if (label && link) {
        keyboard = JSON.stringify({
          inline: true,
          buttons: [
            [
              {
                action: {
                  type: 'open_link',
                  link,
                  label,
                },
              },
            ],
          ],
        });
      }
    } catch (e) {
      logger.error(`createCronJob failed to create keyboard: ${e}`);
    }
  }

  const logMeta = getCronLogMeta(cron);
  logger.debug(`CREATE Cron job for cron ${logMeta}`);

  return new CronJob(
    `00 ${minutes} ${hours} * * ${daysRange}`,
    () => {
      try {
        if (!shouldCallCron(startDate, Date.now(), repeat)) {
          logger.debug(`Cron Job JUST CANNCELED for cron ${logMeta}`);

          return;
        }
      } catch (e) {
        logger.error(`Date-fns error, ${e}`);
      }

      try {
        sendMessage({
          peer_id: chatId,
          message,
          keyboard,
          random_id: 0,
        });
        logger.debug(`Cron Job JUST RUN for cron ${logMeta}`);
      } catch (e) {
        logger.debug(`Cron Job FAILED TO RUN ${logMeta}: ${e}`);
      }
    },
    () => {
      logger.debug(`Cron Job STOPPED for cron ${logMeta}`);
    },
    true,
    'Europe/Moscow',
  );
}

const repeatToString = [
  'каждую неделю',
  'раз в месяц',
  'через неделю',
  'через две недели',
];

function getCronLogMeta(
  cron: Omit<ICrons.ChatCron, 'id'> & { id?: number },
): string {
  const { id, message, daysRange, timeAt, chatId, buttons, repeat, startDate } =
    cron;
  const common = `"${message}"${
    buttons ? ' with button' : ''
  } repeating [${daysRange}] (week repeat: ${repeat} - ${
    repeatToString[repeat]
  }) at ${timeAt} starting date: ${new Date(startDate).toLocaleDateString(
    'ru-RU',
  )} for ${chatId}`;

  return id ? `[${id}]: ${common}` : common;
}
