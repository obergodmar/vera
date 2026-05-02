import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import {
  BotChatList,
  BotChatMembers,
  BotUser,
  IApi,
} from '@vera-reforged/common';

import { createHash, createHmac } from 'crypto';
import { In, Repository } from 'typeorm';

import { TelegramApiService } from '../bot-core/telegram-api.service';
import { IEnvironment } from '../environments/env-type';
import { DebugService } from '../logger/debug.service';
import { LoggerService } from '../logger/logger.service';
import { TelegramChat } from './entities/telegram-chat.entity';
import { TelegramChatMember } from './entities/telegram-chat-member.entity';
import { IBotPlatform, IBotSendOptions } from './IBotPlatform';

@Injectable()
export class TelegramBotPlatformService implements IBotPlatform {
  readonly platform = 'telegram' as const;

  private readonly logger: DebugService;
  private readonly telegramBotToken: string;

  public constructor(
    @Inject(TelegramApiService)
    private readonly telegramApi: TelegramApiService,
    @Inject(ConfigService) config: ConfigService,
    @InjectRepository(TelegramChat)
    private readonly chatRepo: Repository<TelegramChat>,
    @InjectRepository(TelegramChatMember)
    private readonly memberRepo: Repository<TelegramChatMember>,
    @Inject(LoggerService) loggerService: LoggerService,
  ) {
    this.logger = new DebugService(loggerService, this.constructor.name);
    this.telegramBotToken =
      config.get<IEnvironment['telegramBotToken']>('telegramBotToken') ?? '';
  }

  public async sendMessage(
    peerId: number,
    text: string,
    opts?: IBotSendOptions,
  ): Promise<void> {
    const inlineKeyboard = opts?.linkButtons?.length
      ? [
          opts.linkButtons.map(({ label, link }) => ({
            text: label,
            url: link,
          })),
        ]
      : undefined;

    await this.telegramApi.sendMessage(peerId, text, {
      replyToMessageId: opts?.replyToMessageId,
      inlineKeyboard,
    });
  }

  public async getChats(userId: number): Promise<BotChatList> {
    try {
      const members = await this.memberRepo.find({
        where: { userId, isActive: true },
      });
      const chatIds = members.map((m) => m.chatId);

      if (chatIds.length === 0) return { count: 0, items: [] };

      const chats = await this.chatRepo.find({
        where: { id: In(chatIds), isActive: true },
      });

      return {
        count: chats.length,
        items: chats.map((c) => ({ id: c.id, title: c.title, photo: c.photo })),
      };
    } catch (error: unknown) {
      this.logger.error(`getChats: ${error}`);
      return { count: 0, items: [] };
    }
  }

  public async getChatMembers(chatId: number): Promise<BotChatMembers> {
    try {
      const members = await this.memberRepo.find({
        where: { chatId, isActive: true },
      });

      return {
        count: members.length,
        items: members.map((m) => tgMemberToBotUser(m)),
      };
    } catch (error: unknown) {
      this.logger.error(`getChatMembers: ${error}`);
      return { count: 0, items: [] };
    }
  }

  public async getUsers(userIds: number[]): Promise<BotUser[]> {
    if (userIds.length === 0) return [];
    try {
      const members = await this.memberRepo.find({
        where: { userId: In(userIds) },
      });
      const seen = new Set<number>();
      return members
        .filter((m) => {
          if (seen.has(m.userId)) return false;
          seen.add(m.userId);
          return true;
        })
        .map((m) => tgMemberToBotUser(m));
    } catch (error: unknown) {
      this.logger.error(`getUsers: ${error}`);
      return [];
    }
  }

  public async isMember(chatId: number, userId: number): Promise<boolean> {
    try {
      const member = await this.memberRepo.findOne({
        where: { chatId, userId, isActive: true },
      });
      return !!member;
    } catch {
      return false;
    }
  }

  public async authorizeUser(
    data: IApi.IAuthApi.VkAuthData | IApi.IAuthApi.TelegramAuthData,
  ): Promise<{ user: BotUser; token: string } | null> {
    const tgData = data as IApi.IAuthApi.TelegramAuthData;

    if (!this.verifyTelegramHash(tgData)) return null;

    const ageSec = Math.floor(Date.now() / 1000) - tgData.auth_date;
    if (ageSec > 86400) return null;

    const user: BotUser = {
      id: tgData.id,
      firstName: tgData.first_name,
      lastName: tgData.last_name,
      username: tgData.username,
      photo: tgData.photo_url,
      mention: tgData.username ? `@${tgData.username}` : undefined,
    };

    return { token: tgData.hash, user };
  }

  public async validateToken(
    _token: string,
    _userId: number,
  ): Promise<boolean> {
    return true;
  }

  private verifyTelegramHash(data: IApi.IAuthApi.TelegramAuthData): boolean {
    const { hash, ...rest } = data;

    const dataCheckString = (
      Object.entries(rest) as [string, string | number | undefined][]
    )
      .filter(([, v]) => v !== undefined)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join('\n');

    const secretKey = createHash('sha256')
      .update(this.telegramBotToken)
      .digest();
    const computedHash = createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    return computedHash === hash;
  }
}

function tgMemberToBotUser(m: TelegramChatMember): BotUser {
  return {
    id: m.userId,
    firstName: m.firstName,
    lastName: m.lastName,
    username: m.username,
    photo: m.photo,
    mention: m.username ? `@${m.username}` : undefined,
  };
}
