import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { getRandomElement, IApi, ICommands } from '@vera-reforged/common';

import { DataSource, Repository } from 'typeorm';

import { BotEventBusService } from '../bot-core/bot-event-bus.service';
import { BOT_PLATFORM_TOKEN, IBotPlatform } from '../bot-platform/IBotPlatform';
import { IEnvironment } from '../environments/env-type';
import { DebugService } from '../logger/debug.service';
import { LoggerService } from '../logger/logger.service';
import {
  CreateRollCommandDto,
  DeleteRollCommandDto,
  UpdateRollCommandDto,
} from './commands.dto';
import { Command, RollCommand } from './commands.entity';

@Injectable()
export class CommandsService {
  private readonly logger: DebugService;

  public constructor(
    private dataSource: DataSource,
    @InjectRepository(Command)
    private readonly commandRepository: Repository<Command>,
    @InjectRepository(RollCommand)
    private readonly rollCommandRepository: Repository<RollCommand>,
    @Inject(BOT_PLATFORM_TOKEN) private readonly bot: IBotPlatform,
    @Inject(BotEventBusService)
    private readonly botEventBus: BotEventBusService,
    @Inject(ConfigService) private readonly config: ConfigService,
    @Inject(LoggerService) loggerService: LoggerService,
  ) {
    this.logger = new DebugService(loggerService, this.constructor.name);

    const isListenerOff =
      this.config.get<IEnvironment['disableBotListener']>('disableBotListener');

    this.botEventBus.onMessage(async (event) => {
      if (isListenerOff) {
        return;
      }

      const { peerId, text } = event;
      if (!text) {
        return;
      }

      const matches = [
        ...text.matchAll(/\/(?<command>\S+)(\s(?<name>\S+))?/gu),
      ].map((m) => m.groups || { command: null, name: null });

      if (matches.length > 0) {
        this.lookForCommandAndAnnounce.call(this, peerId, matches);
      }
    });
  }

  private async lookForCommandAndAnnounce(
    peerId: number,
    matches: {
      command: string | null;
      name: string | null;
    }[],
  ) {
    const chatMembersResult = await this.bot.getChatMembers(peerId);
    const res = await this.getCommandsForChat(peerId, { enabled: true });
    if (res.count === 0 || chatMembersResult.count === 0) {
      this.logger.debug(
        `for chat ${peerId} there are no commands or there are no members`,
      );
      return;
    }

    const members = new Map(
      chatMembersResult.items.map((member) => [member.id, member]),
    );

    try {
      for (const { command, name: commandNameExtra } of matches) {
        const existingEnabledCommands = res.items.filter(
          ({ name, nameExtra }) =>
            name === command &&
            ((!commandNameExtra && !nameExtra) ||
              commandNameExtra === nameExtra),
        );
        if (existingEnabledCommands.length === 0) {
          continue;
        }

        for (const {
          command: { membersIds, phrase },
        } of existingEnabledCommands) {
          const existingMembersIds =
            membersIds === ''
              ? [...members.keys()]
              : membersIds
                  .split(',')
                  .map(Number)
                  .filter((id) => members.has(id));

          const randomTarget = getRandomElement(existingMembersIds);
          const profile = members.get(randomTarget);
          if (!profile) {
            this.logger.error(
              `No profile for the random target id: ${randomTarget}`,
            );
            continue;
          }

          const mention = profile.mention ?? profile.firstName;
          const message = `${phrase} ${mention}`;
          this.logger.debug(`Sending command to ${peerId}: ${message}`);

          await this.bot.sendMessage(peerId, message);
        }
      }
    } catch (e) {
      this.logger.error(`Trying to send a phrase to chat ${peerId}: ${e}`);
    }
  }

  public async createRollCommandForChat(
    createRollCommandDto: CreateRollCommandDto,
  ): Promise<IApi.ICommandsApi.CreateRollCommandForChatResponse> {
    const { chatId, phrase, name, membersIds, enabled } = createRollCommandDto;
    let error: string;

    const logMeta = getRollCommandLogMeta(createRollCommandDto);

    this.logger.debug(`Creating roll command ${logMeta}`);
    this.logger.debug(`Starting creating transaction for chat ${chatId}`);

    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const res = await queryRunner.manager.insert(RollCommand, {
        chatId,
        phrase,
        membersIds: membersIds === '' ? null : membersIds,
      });

      await queryRunner.manager.insert(Command, {
        id: res.identifiers[0].id,
        chatId,
        command: 'roll',
        name: name || null,
        enabled,
      });

      await queryRunner.commitTransaction();
      this.logger.debug(
        `Create transaction for chat ${chatId} was successfully completed`,
      );
    } catch (e) {
      error = JSON.stringify(e);

      this.logger.error(`Create transaction failed: ${e}`);
      this.logger.error(`Couldn't create roll command ${logMeta}: ${e}`);

      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }

    if (error) {
      return { error: 'Ошибка создания команды', success: false };
    }

    return { success: true };
  }

  public async updateRollCommandForChat(
    updateRollCommandDto: UpdateRollCommandDto,
  ): Promise<IApi.ICommandsApi.UpdateRollCommandForChatResponse> {
    const { id, chatId, phrase, name, membersIds, enabled } =
      updateRollCommandDto;
    let error: string;

    const logMeta = getRollCommandLogMeta(updateRollCommandDto);

    this.logger.debug(`Updating roll command ${logMeta}`);
    this.logger.debug(`Starting transaction for chat ${chatId}`);

    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      await queryRunner.manager.update(
        RollCommand,
        { chatId, id },
        { phrase, membersIds: membersIds === '' ? null : membersIds },
      );
      await queryRunner.manager.update(
        Command,
        { chatId, id },
        { enabled, name: name || null },
      );

      await queryRunner.commitTransaction();
      this.logger.debug(
        `Update transaction for chat ${chatId} was successfully completed`,
      );
    } catch (e) {
      error = JSON.stringify(e);

      this.logger.error(`Update transaction failed: ${e}`);
      this.logger.error(`Couldn't update roll command ${logMeta}: ${e}`);

      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }

    if (error) {
      return { error: 'Ошибка обновления команды', success: false };
    }

    return { success: true };
  }

  public async deleteRollCommandForChat(
    deleteRollCommandDto: DeleteRollCommandDto,
  ): Promise<IApi.ICommandsApi.DeleteRollCommandForChatResponse> {
    const { chatId, id } = deleteRollCommandDto;
    let error: string;

    let rollCommand: RollCommand;
    try {
      rollCommand = await this.rollCommandRepository.findOne({
        where: { id, chatId },
      });
    } catch (e) {
      this.logger.error(
        `Delete transaction failed - roll command doesn't exist: ${e}`,
      );
      return { error: 'Нельзя удалить команды, которой нет', success: false };
    }

    const logMeta = getRollCommandLogMeta(rollCommand);

    this.logger.debug(`Deleting roll command ${logMeta}`);
    this.logger.debug(`Start delete transaction for chat ${chatId}`);

    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      await queryRunner.manager.delete(RollCommand, { chatId, id });
      await queryRunner.manager.delete(Command, { chatId, id });

      await queryRunner.commitTransaction();
      this.logger.debug(
        `Delete transaction for chat ${chatId} was successfully completed`,
      );
    } catch (e) {
      error = JSON.stringify(e);

      this.logger.error(`Delete transaction failed: ${e}`);
      this.logger.error(`Couldn't delete roll command ${logMeta}: ${e}`);

      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }

    if (error) {
      return { error: 'Ошибка удаления команды', success: false };
    }

    return { success: true };
  }

  public async getCommandsChats(): Promise<IApi.ICommandsApi.GetCommandsChatsResponse> {
    this.logger.debug('Commands chats were requested');

    try {
      const commandsChats = await this.commandRepository.find();
      this.logger.debug('Commands chats were successfully sent');
      return {
        count: commandsChats.length,
        items: commandsChats.map(({ chatId }) => chatId),
      };
    } catch (e) {
      this.logger.error(`Couldn't get commands chats: ${e}`);
      return { count: 0, items: [] };
    }
  }

  public async getCommandsForChat(
    chatId: number,
    opts?: { enabled: boolean },
  ): Promise<IApi.ICommandsApi.GetCommandsForChatResponse> {
    this.logger.debug(`Getting commands for chat ${chatId}`);

    try {
      const commands = await this.commandRepository.find({
        where: { chatId, ...(opts ?? {}) },
      });

      const accumulatedCommands = await commands.reduce(
        async (
          accPromise: Promise<IApi.ICommandsApi.GetCommandsForChatResponse>,
          command,
        ) => {
          const acc = await accPromise;
          switch (command.command) {
            case 'roll': {
              const rollCommands = await this.rollCommandRepository.find({
                where: { chatId, id: command.id },
              });

              if (rollCommands) {
                acc.count += rollCommands.length;
                acc.items.push(
                  ...rollCommands.map(
                    ({
                      id,
                      chatId,
                      phrase,
                      membersIds,
                      created,
                      modified,
                    }) => ({
                      name: 'roll' as ICommands.CommandsNames,
                      nameExtra: command.name ?? undefined,
                      command: {
                        id,
                        chatId,
                        phrase,
                        membersIds: membersIds ?? '',
                        created,
                        modified,
                      },
                      enabled: command.enabled,
                    }),
                  ),
                );
              }
              break;
            }

            default:
              break;
          }
          return acc;
        },
        Promise.resolve({ count: 0, items: [] }),
      );

      return accumulatedCommands;
    } catch (e) {
      this.logger.error(`Couldn't get commands for chat ${chatId}: ${e}`);
      return { count: 0, items: [] };
    }
  }

  public async disableCommandsForChat(
    chatId: number,
  ): Promise<IApi.ICommandsApi.DisableCommandsForChatResponse> {
    this.logger.debug(`Start disabling all commands for chat: ${chatId}`);

    try {
      const res = await this.commandRepository.update(
        { chatId },
        { enabled: false },
      );

      this.logger.debug(
        `Successfully disabled all commands for chat: ${chatId}`,
      );

      return { success: true, count: res.affected };
    } catch (e) {
      this.logger.error(`Couldn't disable commands for chat: ${chatId}: ${e}`);
      return { success: false, error: 'Ошибка записи в базу данных' };
    }
  }

  public async disableAllCommands(): Promise<IApi.ICommandsApi.DisableAllCommandsResponse> {
    this.logger.debug('Start disabling all commands');

    try {
      const res = await this.commandRepository.update({}, { enabled: false });

      this.logger.debug('Successfully disabled all commands');

      return { success: true, count: res.affected };
    } catch (e) {
      this.logger.error(`Couldn't disable all commands: ${e}`);
      return { success: false, error: 'Ошибка записи в базу данных' };
    }
  }
}

function getRollCommandLogMeta(
  rollCommand: Omit<ICommands.RollCommand, 'id'> & {
    id?: ICommands.RollCommand['id'];
  },
): string {
  const { id, chatId, phrase, membersIds } = rollCommand;

  return `${id && `(${id})`}${phrase} for ${chatId} ${
    membersIds !== '' ? (membersIds ?? '').split(',').length : 'all chat'
  } users`;
}
