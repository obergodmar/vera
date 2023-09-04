import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { IApi, ICrons } from '@vera-reforged/common';

import { CronJob } from 'cron';
import { Repository } from 'typeorm';
import { APIMessages } from 'vk-io/lib/api/schemas/methods';
import { MessagesSendParams } from 'vk-io/lib/api/schemas/params';

import { IEnvironment } from '../environments/env-type';
import { LoggerService } from '../logger/logger.service';
import { VkApiService } from '../vk-api/vk-api.service';
import { CreateCronForChatDto, UpdateCronForChatDto } from './crons.dto';
import { Cron } from './crons.entity';

@Injectable()
export class CronsService {
  private cronJobs: Map<number, CronJob> = new Map();
  private readonly sendMessage: APIMessages['send'];
  private readonly log: LoggerService['log'];

  public constructor(
    @InjectRepository(Cron)
    private readonly cronsRepository: Repository<Cron>,
    @Inject(VkApiService) private readonly api: VkApiService,
    @Inject(LoggerService) private readonly logger: LoggerService,
    @Inject(ConfigService) private readonly config: ConfigService
  ) {
    const isListenerOff =
      this.config.get<IEnvironment['disableBotListener']>('disableBotListener');

    this.sendMessage = (params: MessagesSendParams) => {
      if (isListenerOff) {
        return;
      }

      return this.api.botService.vk.api.messages.send(params);
    };

    this.log = this.logger.log.bind(this.logger);

    this.logger.log('CronsService: Crons initial load started');
    this.cronsRepository
      .find({
        where: { enabled: true },
      })
      .then((crons) => {
        crons.forEach((cron) => {
          this.cronJobs.set(
            cron.id,
            createCronJob(cron, this.sendMessage, this.log)
          );
        });

        this.logger.log(`CronsService: ${crons.length} cron jobs created`);
      })
      .catch((e) => {
        this.logger.log(`CronsService: Crons initial load failed: ${e}`, {
          type: 'error',
        });
      });
  }

  public async getCronsForChat(
    chatId: number
  ): Promise<IApi.ICronsApi.GetCronsForChatResponse> {
    this.logger.log(`CronsService: crons were requested for chat ${chatId}`);

    try {
      const crons = await this.cronsRepository.find({
        where: { chatId },
      });

      return {
        count: crons.length,
        items: crons,
      };
    } catch (e) {
      this.logger.log(
        `CronsService: error getting crons for chat ${chatId}: ${e}`,
        { type: 'error' }
      );

      return {
        count: 0,
        items: [],
      };
    }
  }

  public async getCronsChatsResponse(): Promise<IApi.ICronsApi.GetCronsChatsResponse> {
    this.logger.log('CronsService: crons chats were requested');

    try {
      const cronsChats = await this.cronsRepository.find();

      this.logger.log('CronsService: crons chats were sucessfully sent');

      return {
        count: cronsChats.length,
        items: cronsChats.map(({ chatId }) => chatId),
      };
    } catch (e) {
      this.logger.log(`CronsService: error getting cron chats: ${e}`, {
        type: 'error',
      });

      return {
        count: 0,
        items: [],
      };
    }
  }

  public async createCronForChat(
    cronCreationDto: CreateCronForChatDto
  ): Promise<IApi.ICronsApi.CreateCronForChatResponse> {
    const { chatId, message, daysRange, timeAt, buttons, enabled } =
      cronCreationDto;

    const logMeta = getCronLogMeta(cronCreationDto);
    this.logger.log(`CronsService: Creating cron ${logMeta}`);

    try {
      const res = await this.cronsRepository.insert({
        chatId,
        timeAt,
        enabled,
        message,
        daysRange,
        buttons,
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
          },
          this.sendMessage,
          this.log
        )
      );
    } catch (e) {
      this.logger.log(
        `CronsService: Error when creating cron ${logMeta}: ${e}`,
        { type: 'error' }
      );

      return {
        success: false,
        error: JSON.stringify(e),
      };
    }

    return {
      success: true,
    };
  }

  public async updateCronForChat(
    cronUpdateDto: UpdateCronForChatDto
  ): Promise<IApi.ICronsApi.UpdateCronForChatResponse> {
    const { id, chatId, message, daysRange, timeAt, buttons, enabled } =
      cronUpdateDto;

    const isDeleting = !message || !daysRange || !timeAt;

    const logMeta = getCronLogMeta(cronUpdateDto);
    this.logger.log(
      `CronsService: ${isDeleting ? 'Deleting' : 'Updating'} cron ${
        !isDeleting ? `${logMeta}` : `${id} for ${chatId}`
      }`
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
          [{ id, chatId, daysRange, timeAt, message, enabled, buttons }],
          ['id']
        );

        if (enabled) {
          this.cronJobs.set(
            id,
            createCronJob(
              { id, chatId, daysRange, timeAt, message, enabled, buttons },
              this.sendMessage,
              this.log
            )
          );
        }
      }
    } catch (e) {
      this.logger.log(
        `CronsService: Error updating cron ${id} in ${chatId}: ${e}`,
        { type: 'error' }
      );
      return {
        error: JSON.stringify(e),
        success: false,
      };
    }

    return {
      success: true,
    };
  }

  public async disableCronsForChat(
    chatId: number
  ): Promise<IApi.ICronsApi.DisableCronsForChatResponse> {
    this.logger.log(
      `CronsService: Start disabling all crons for chat: ${chatId}`
    );

    try {
      const { items } = await this.getCronsForChat(chatId);
      const ids = items.map(({ id }) => id);
      const res = await this.cronsRepository.update(
        { chatId },
        { enabled: false }
      );

      this.cronJobs.forEach((job, id) => {
        if (ids.includes(id)) {
          job.stop();
          this.cronJobs.delete(id);
        }
      });

      this.logger.log(
        `CronsService: Successfully disabled all crons for chat: ${chatId}`
      );

      return {
        success: true,
        count: res.affected,
      };
    } catch (e) {
      this.logger.log(
        `CronsService: Error when disabling crons for chat: ${chatId}: ${e}`,
        { type: 'error' }
      );

      return {
        error: JSON.stringify(e),
      };
    }
  }

  public async disableAllCrons(): Promise<IApi.ICronsApi.DisableAllCronsResponse> {
    this.logger.log('CronsService: Start disabling all crons');

    try {
      const res = await this.cronsRepository.update({}, { enabled: false });

      this.logger.log('CronsService: Successfully disabled all crons ');


      this.cronJobs.forEach((job, id) => {
        job.stop();
        this.cronJobs.delete(id);
      });


      return {
        success: true,
        count: res.affected,
      };
    } catch (e) {
      this.logger.log(`CronsService: Error when disabling all crons: ${e}`, {
        type: 'error',
      });

      return {
        error: JSON.stringify(e),
      };
    }
  }
}

function createCronJob(
  cron: ICrons.ChatCron,
  sendMessage: APIMessages['send'],
  log: LoggerService['log']
): CronJob {
  const { timeAt, chatId, daysRange, message, buttons } = cron;
  const [hours, minutes] = timeAt.split(':');

  let keyboard: string | undefined;

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
    log(`CronsService: createCronJob failed to create keyboard: ${e}`, {
      type: 'error',
    });
  }

  const logMeta = getCronLogMeta(cron);
  log(`CronsService: CREATE Cron job for cron ${logMeta}`);

  return new CronJob(
    `00 ${minutes} ${hours} * * ${daysRange}`,
    () => {
      try {
        sendMessage({
          peer_id: chatId,
          message,
          keyboard,
          random_id: 0,
        });
        log(`CronsService: Cron Job JUST RUN for cron ${logMeta}`);
      } catch (e) {
        log(`CronsService: Cron Job FAILED TO RUN ${logMeta}: ${e}`, {
          type: 'error',
        });
      }
    },
    () => {
      log(`CronsService: Cron Job STOPPED for cron ${logMeta}`);
    },
    true,
    'Europe/Moscow'
  );
}

function getCronLogMeta(
  cron: Omit<ICrons.ChatCron, 'id'> & { id?: number }
): string {
  const { id, message, daysRange, timeAt, chatId, buttons } = cron;
  const common = `"${message}"${
    buttons ? ' with button' : ''
  } repeating [${daysRange}] at ${timeAt} for ${chatId}`;

  return id ? `[${id}]: ${common}` : common;
}
